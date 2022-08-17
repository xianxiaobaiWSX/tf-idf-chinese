

var fs = require('fs');
// 导入分词器
var Segment = require('segment').Segment;
var segment = new Segment();
segment.useDefault();
class TfIdf {

    constructor() { this.corpus = [], this.tracker = [] }

    /**
     * 通过字符串添加至数据集
     * @param {string} str 
     * @returns 
     */
    addDocumentFromString(str) {
        let strArray = segment.doSegment(str, { simple: true, stripPunctuation: true });
        this.corpus.push(strArray);
        this.tracker.push({
            index: this.corpus.length - 1,
            document: str
        })
        return this.corpus
    }

    /**
     * 通过数组方式解析数据集
     * @param {Array} docs 
     * @returns 
     */
    createCorpusFromStringArray(docs) {
        let corpus = [];
        for (let i = 0; i < docs.length; i++) {
            this.corpus.push(segment.doSegment(docs[i], { simple: true, stripPunctuation: true }));
            this.tracker.push({
                index: this.corpus.length - 1,
                document: docs[i]
            })
        }
        return this.corpus
    }

    /**
    * 计算文档中给定术语的术语频率（tf）
    * 术语频率计算为：
    * 文件期限/长度的出现次数；
    */
    calculateTermFrequency(term, doc) {
        let numOccurences = 0;
        for (let i = 0; i < doc.length; i++) {
            if (doc[i].toLowerCase() == term.toLowerCase()) {
                numOccurences++;
            }
        }
        return (numOccurences * 1.0 / (doc.length + 1))
    }

    /*
    * Calculates the inverse document frequency (idf) of a term in a given document
    * idf = log(number of documents where the term appears / term frequency)
    */

    calculateInverseDocumentFrequency(term) {
        if (this.corpus == null) return -1;
        let numDocs = 0;
        for (let i = 0; i < this.corpus.length; i++) {
            for (let j = 0; j < this.corpus[i].length; j++) {
                if (this.corpus[i][j] == term.toLowerCase()) {
                    numDocs++;
                    break;
                }
            }
        }
        return Math.log((this.corpus.length) / (numDocs + 1)) + 1;
    }

    /*
    * Creates a vector of the idf of the query term in a given document
    */

    createIdfModel(query) {
        query = Array.isArray(query) ? query : query.split(" ");
        if (this.corpus == null) return null;
        let model = [];
        for (let i = 0; i < query.length; i++) {
            model.push(this.calculateInverseDocumentFrequency(query[i]));
        }
        return model;
    }

    /*
    * creates a vector of the tf-idf values for each query term
    * tf-idf = tf * idf
    */

    createVectorSpaceModel(query, doc) {
        query = Array.isArray(query) ? query : query.split(" ");
        if (this.corpus == null) return null;
        let termFrequencyModel = [];
        let vectorSpaceModel = []
        for (let i = 0; i < query.length; i++) {
            termFrequencyModel.push(this.calculateTermFrequency(query[i], doc));
        }
        let idfModel = this.createIdfModel(query);
        for (let j = 0; j < idfModel.length; j++) {
            vectorSpaceModel[j] = idfModel[j] * termFrequencyModel[j];
        }
        this.vectorSpaceModel = vectorSpaceModel;
        return vectorSpaceModel
    }

    /*
    * calculates the cosine similarity between two vectors computed as thier dot
    * product. The higher the cosine similarity of a given document the closer of
    * a match it is to the query.
    */
    calculateSimilarityIndex(query, doc) {
        query = Array.isArray(query) ? query : query.split(" ");
        let query_vector = this.createVectorSpaceModel(query, query);
        let doc_vector = this.createVectorSpaceModel(query, doc);
        let similarityIndex = 0;
        for (let i = 0; i < query.length; i++) {
            let toAdd = query_vector[i] * doc_vector[i];
            if (isNaN(toAdd)) {
                similarityIndex += 0;
            } else {
                similarityIndex += toAdd;
            }
        }
        let query_mag = this.calculateMagnitude(query_vector);
        let doc_mag = this.calculateMagnitude(doc_vector);
        let similarity = 1.0 * similarityIndex / (query_mag * doc_mag);
        return isNaN(similarity) ? 0 : similarity
    }
    /*
    * Ranks the documents in your corpus according to a query
    */
    rankDocumentsByQuery(query) {
        query = segment.doSegment(query, { simple: true, stripPunctuation: true });
        let ranking = [];
        for (let i = 0; i < this.corpus.length; i++) {
            ranking.push({
                document: this.corpus[i],
                similarityIndex: this.calculateSimilarityIndex(query, this.corpus[i]),
                index: i,
            });
        }
        ranking.sort((a, b) => {
            return b.similarityIndex - a.similarityIndex;
        })
        return ranking;
    }


    /*
    * Calculates the magnitude of an input vector
    */
    calculateMagnitude(vector) {
        let magnitude = 0
        for (let i = 0; i < vector.length; i++) {
            if (isNaN(vector[i])) {
                magnitude += 0;
            } else {
                magnitude += vector[i] * vector[i];
            }
        }
        return Math.sqrt(magnitude);
    }

    /*
    * Find tracker of original documents
    */
    indicesOfInputs() {
        return this.tracker;
    }

}

module.exports = TfIdf
