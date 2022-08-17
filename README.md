# tf-idf-chinese

基于tf-idf-search代码改进, tf-idf-search不支持中文分词



### 安装
```javascript
npm i tf-idf-chinese
// or
yarn add tf-idf-chinese
```

### 使用


导入代码
```javascript
// 导入代码
const TfIdf = require('tf-idf-chinese');
// 实例化类
let tf_idf = new TfIdf();




```

#### 创建数据样本

```javascript
let data = [
    "视频平台明星争夺战：“周杰伦”们快不够用了",
    "资本舍不得给喜马拉雅出一个亿",
    "消息称知乎新一轮裁员，平台：正常业务优化调整"
];

// 多条数据添加
tf_idf.createCorpusFromStringArray(data);
// 单条文本添加
tf_idf.addDocumentFromString("快播的再一次上热搜，却是最后一次");

```

#### 调用数据

```javascript

// 按查询对文档排序
var search_result = tf_idf.rankDocumentsByQuery("知乎")
console.log(search_result);
```

查询结果
```json
[
  {
    document: [
      '消息', '称',   '知',
      '乎',   '新',   '一轮',
      '裁员', '平台', '正常',
      '业务', '优化', '调整'
    ],
    similarityIndex: 1.0000000000000002,
    index: 2
  },
  {
    document: [
      '视频',   '平台',
      '明星',   '争夺战',
      '周杰伦', '们',
      '快',     '不',
      '够用',   '了'
    ],
    similarityIndex: 0,
    index: 0
  },
  {
    document: [ '资本', '舍不得', '给', '喜马拉雅', '出', '一个', '亿' ],
    similarityIndex: 0,
    index: 1
  }
]
```

|参数 | 类型 | 解释 |
|---|---|---|
|document | Array | 分词数据 |
|similarityIndex|number | 匹配度 |
|index|number | 数组下标索引 |