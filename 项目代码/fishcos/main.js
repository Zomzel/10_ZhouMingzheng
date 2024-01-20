var viewOption = 1; //记录当前视图

async function openDB() {
  //打开数据库
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("fishcos", 2);
    request.onerror = function (event) {
      reject("Database error: " + event.target.errorCode);
    };

    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onupgradeneeded = function (event) {
      let db = event.target.result;
      // 创建或确保 "legalNodeList" 和 "illegalNodeList" 存在
      if (!db.objectStoreNames.contains("legalNodeList")) {
        db.createObjectStore("legalNodeList", { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("illegalNodeList")) {
        db.createObjectStore("illegalNodeList", { autoIncrement: true });
      }
    };
  });
}

async function addIllegal(nodeId) {
  //添加节点到数据库
  let db = await openDB();
  let transaction = db.transaction(["illegalNodeList"], "readwrite");
  let store = transaction.objectStore("illegalNodeList");
  store.add(nodeId);
}

async function addLegal(nodeId) {
  //添加节点到数据库
  let db = await openDB();
  let transaction = db.transaction(["legalNodeList"], "readwrite");
  let store = transaction.objectStore("legalNodeList");
  store.add(nodeId);
}

async function startCalculation() {
  // 使用数据库数据启动计算
  let db = await openDB();
  let transaction = db.transaction(["illegalNodeList"], "readonly");
  let store = transaction.objectStore("illegalNodeList");
  let request = store.getAll();
  request.onerror = function (event) {
    console.error("Error fetching data from DB", event.target.errorCode);
  };

  request.onsuccess = function (event) {
    let nodeList = event.target.result;
    console.log(nodeList);
    // callback(nodeList); // 使用 nodeList 执行回归计算
  };
}

const container = document.getElementById("mountNode"); // 主展示区的容器
// 获取container的宽高
const width = container.scrollWidth;
const height = container.scrollHeight || 500;

// 查找节点框
var dataList = document.querySelector("#nodelist");
var egonet = document.querySelector("#ego");

fetch("./data/hieFormatted.json")
  .then((res) => res.json())
  .then((data) => {
    // 遍历JSON对象的键
    hieData = data;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        // 为每个键创建一个新的<option>元素
        var option = document.createElement("option");
        option.value = key; // 将键作为option的值
        // 将<option>元素添加到datalist中
        dataList.appendChild(option);
      }
    }
  });

var nodeTypeInfo = {};

// 初始化ECharts实例
var myChart = echarts.init(document.getElementById("mountNode"));

function renderTree(targetNode) {
  // 异步加载数据
  var searchInTree = document.querySelector("#searchInput");
      searchInTree.style.display = "flex";
  fetch("./data/hieFormatted.json")
    .then((res) => res.json())
    .then((data) => {
      // 在数据加载完成后执行以下操作
      // 获取树状数据
      var treeData = data[targetNode];

      if (treeData == null) {
        root = {
          name: targetNode,
          type: targetInfor["type"],
          times: 1,
          children: [],
        };
        treeData = root;
      }

      // 配置图表参数
      var option = {
        tooltip: {
          trigger: "item",
          triggerOn: "mousemove",
          formatter: function (params) {
            var data = params.data;
            var tooltipContent = `名称: ${data.name}<br>`;
            tooltipContent += `类型: ${data.type}<br>`;
            tooltipContent += `次数: ${data.times}`;
            if (data.suspected) {
              tooltipContent += `<br><span style="color: red;">所有权流异常</span>`;
            }
            return tooltipContent;
          },
        },
        toolbox: {
          show: true,
          feature: {
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        backgroundColor: "white",
        series: [
          {
            type: "tree",
            data: [treeData],
            top: "5%",
            left: "20%",
            bottom: "5%",
            right: "20%",
            symbolSize: 10,
            // 其他树状图配置...
            label: {
              color: "black", // 设置节点标签颜色为白色
              position: "top", // 节点标签显示在节点上方
              verticalAlign: "middle", // 垂直对齐方式
              align: "center", // 水平对齐方式
            },
            // 开启拖动和缩放功能
            draggable: true,
            roam: "move", // 启用画布拖动
            zoomToNodeRatio: 1, // 控制缩放级别
            emphasis: {
              focus: "descendant",
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750,
          },
        ],
      };
      // 设置图表参数
      myChart.setOption(option, { notMerge: true });

      myChart.on("contextmenu", function (params) {
        if (params.dataType === "node") {
          // 阻止浏览器默认的右键菜单
          event.preventDefault();
          // 设置自定义菜单的位置并显示它
          customMenu.style.top = event.pageY + "px";
          customMenu.style.left = event.pageX + "px";
          customMenu.style.display = "block";
          foucsNode = params.data.name;
        }
      });

      // 获取datalist元素
      var treeDataList = document.getElementById("treeNodelist"); // 请将 'yourDatalistId' 替换为实际的 id
      // 删除所有子元素
      while (treeDataList.hasChildNodes()) {
        treeDataList.removeChild(treeDataList.lastChild);
      }
      // 更新搜索框
      function updateSearchBox(subNode) {
        var option = document.createElement("option");
        option.value = subNode.name; // 将键作为option的值
        // 将<option>元素添加到datalist中
        treeNodelist.appendChild(option);
        if (subNode.children) {
          for (var i = 0; i < subNode.children.length; i++) {
            updateSearchBox(subNode.children[i]);
          }
        }
      }
      updateSearchBox(treeData);
    });
}

// 定义搜索并聚焦节点的函数
function searchAndFocus(value) {
  var key = value.trim();
  if (key === "") {
    alert("搜索关键词不能为空！");
    return;
  }

  var tree = myChart.getModel().getComponent("series").option.data;
  console.log(tree);
  var node = tree[0];
  var foundNode = null;
  var path = [];

  (function searchNode(subNode, currentPath) {
    if (subNode.name == key) {
      foundNode = subNode;
      path = currentPath.concat(subNode.name); // Concatenate the current node to the path
      return;
    }
    if (subNode.children) {
      for (var i = 0; i < subNode.children.length; i++) {
        searchNode(subNode.children[i], currentPath.concat(subNode.name));
      }
    }
  })(node, []);

  if (foundNode) {
    console.log(foundNode);
    console.log(path);
    // 将path展示在content区域
    while (content.hasChildNodes()) {
      content.removeChild(content.lastChild);
    }
    var p1 = document.createElement("p1");
    p1.style.color = "white";
    p1.innerText = "通过如下路径定位" + value;
    content.appendChild(p1);
    var p = document.createElement("p");
    p.innerText = path.join(" => ");
    p.style.color = "white";
    content.appendChild(p);
    content.display = "flex";
    alert("找到了指定的节点！路径在左侧哦");
  } else {
    alert("未找到指定的节点！");
  }
}


var lineColorBar = {
  family_relationship: "#F012BE",
  ownership: "rgb(255, 0, 0)",
  membership: "#00CED1",
  partnership: "rgb(255, 215, 0)",
  targetNode: "#00ff00",
  otherNodes: "#00ff"
};

var categories = ["family_relationship", "ownership", "membership", "partnership"];
var nodeTypes = ["person", "company", "location", "organization", "political_organization", "event", "movement", "vessel", "uncertain"]

var imageBar = {
  person: "image://image/个人.png",
  company: "image://image/公司.png",
  location: "image://image/坐标.png",
  organization: "image://image/组织.png",
  political_organization: "image://image/政治.png",
  event: "image://image/事件.png",
  movement: "image://image/move.png",
  vessel: "image://image/轮船.png",
  legal: "image://image/正常.png",
  illegal: "image://image/可疑.png",
  uncertain: "image://image/未知.png",
};

function renderNet(targetNode) {
  var searchInTree = document.querySelector("#searchInput");
      searchInTree.style.display = "none";
  // 渲染网络图
  fetch("./data/graphData.json")
    .then((res) => res.json())
    .then((data) => {
      var graphData = data;
      var subGraph = { nodes: [], edges: [] };
      var neighborNodes = new Set();
      var existedNodes = new Set();

      // 把nodeinfo填充
      

      netCorelist.forEach((node) => {
        neighborNodes.add(node);
      });
      graphData.links.forEach((edge) => {
        if (edgeTypeList.has(edge.type)) {
          if (netCorelist.has(edge.source)) {
            neighborNodes.add(edge.target);
            subGraph.edges.push(edge);
          } else if (netCorelist.has(edge.target)) {
            neighborNodes.add(edge.source);
            subGraph.edges.push(edge);
          }
        }
      });
      graphData.nodes.forEach((node) => {
        // 借此机会将nodeinfo信息收集
        nodeTypeInfo[node.name] = node.type;
        if (neighborNodes.has(node.name) && !existedNodes.has(node.name)) {
          if (netCorelist.has(node.name) || nodeTypeList.has(node.type)) {
            existedNodes.add(node.name);
            subGraph.nodes.push(node);
          }
        }
      });

      subGraph.nodes.forEach((node) => {
        node["symbol"] = imageBar[node.type];
        node["symbolSize"] = 50;
        node["itemStyle"] = {
          opacity: 1,
          borderWidth: 1,
          borderColor: "#fff",
        };
      });
      console.log(subGraph.nodes);
      console.log(subGraph.edges);
      console.log(subGraph.nodes);
      var option = {
        legend: {
          data: categories.map(function (a) {
            return { name: a };
          }),
          // 图例的字体颜色设置为白色
          textStyle: {
            color: "#000",
          }
        },
        tooltip: {
          trigger: "item", // 触发类型应该是 'item'
          triggerOn: "mousemove",
          formatter: function (params) {
            if (params.dataType === "node") {
              // 假设节点数据中包含 id 和其他信息
              return "ID: " + params.data.name +"<br>score: "+ params.data.score + params.data.info;
            } else if (params.dataType === "edge") {
              return (
                params.data.source +
                " -> " +
                params.data.target +
                "<br>relation: " +
                params.data.label
              );
            }
          },
        },
        toolbox: {
          show: true,
          feature: {
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        backgroundColor: "white",
        graphic: echarts.util.map(data, function (item, dataIndex) {
          return {
            type: "circle",
            position: myChart.convertToPixel("grid", item),
            shape: {
              cx: 0,
              cy: 0,
              r: item.symbolSize / 2 + 5, // 根据图片大小调整半径
            },
            style: {
              fill: "none",
              stroke: "#ff0000", // 红色
              lineWidth: 5, // 边框宽度
            },
            silent: true, // 如果不需要响应鼠标事件，设置为true
          };
        }),
        series: [
          {
            type: "graph",
            layout: "force",
            draggable: true,
            focusNodeAdjacency: true,
            data: subGraph.nodes.map((node) => ({
              name: node.name, // ECharts 通常使用 name 属性来显示
              class: node.class,
              community: node.community,
              score: node.anomaly_score?node.anomaly_score:0.001,
              value: 100,
              info:
                "<br> type: " +
                node.type +
                "<br> country: " +
                node.country,
              symbol: imageBar[node.class],
              symbolSize: 30, // Adjust the size as needed
              // 如果当前节点为targetNode则设置为不可拖动
              draggable: !(node.name === targetNode),
            })),
            links: subGraph.edges.map((e) => ({
              source: e.source,
              target: e.target,
              label: e.label,
              weight: e.weight,
              lineStyle: {
                color: lineColorBar[e.label],
              }
            })),
            roam: true,
            label: {
              show: true,
              color: "black", // 设置节点标签颜色为白色
              position: "top", // 节点标签显示在节点上方
              verticalAlign: "middle", // 垂直对齐方式
              align: "center", // 水平对齐方式
              formatter: "{b}",
            },
            lineStyle: {
              color: "white",
              // 弯曲
              width: 2,
              curveness: 0.2,
              length: 10,
            },
            edgeLabel: {
              normal: {
                show: false,
                textStyle: {
                  fontSize: 10,
                  color: "white",
                },
                formatter: function (x) {
                  return x.data.label;
                },
              },
            },
            force: {
              repulsion: 1000,
              edgeLength: 100,
            },
            // force: {
            //   // initLayout: 'circular'
            //   // gravity: 0
            //   repulsion: 60,
            //   edgeLength: 2
            // },
            // 其他配置...
            categories: categories.map(function (c) {
              return {
                name: c,
                itemStyle: {
                  color: lineColorBar[c],
                }
              };
            }),
          },
        ],
      };

      myChart.setOption(option, { notMerge: true });
      console.log(myChart.getOption());
    });
}

// 假设我们有一个社区中心点的计算函数
function calculateCommunityCenters(nodes) {
  // 根据社区id聚集节点，并计算每个社区的几何中心
  let communityCenters = {};
  // ... 计算每个社区的中心
  return communityCenters;
}

// 聚类函数
function cluster(targetNode) {
  fetch("./data/graphData.json")
    .then((res) => res.json())
    .then((data) => {
      //获取当前节点的邻域的子图
      var graphData = data;
      var subGraph = { nodes: [], edges: [] };
      var neighborNodes = new Set();
      var existedNodes = new Set();
      netCorelist.forEach((node) => {
        neighborNodes.add(node);
      });

      graphData.links.forEach((edge) => {
        if (edgeTypeList.has(edge.type)) {
          if (netCorelist.has(edge.source)) {
            neighborNodes.add(edge.target);
            subGraph.edges.push(edge);
          } else if (netCorelist.has(edge.target)) {
            neighborNodes.add(edge.source);
            subGraph.edges.push(edge);
          }
        }
      });

      graphData.nodes.forEach((node) => {
        if (neighborNodes.has(node.name) && !existedNodes.has(node.name)) {
          if (netCorelist.has(node.name) || nodeTypeList.has(node.type)) {
            existedNodes.add(node.name);
            subGraph.nodes.push(node);
          }
        }
      });

      subGraph.nodes.forEach((node) => {
        node["symbol"] = imageBar[node.type];
        node["symbolSize"] = 50;
        node["itemStyle"] = {
          opacity: 1,
          borderWidth: 5,
          borderColor: "#f00",
        };
      });

      // 处理节点数据，计算每个社区的圆心位置

      // 设置画布大小
      const canvasSize = {
        width: myChart.getWidth(),
        height: myChart.getHeight(),
      };

      console.log(canvasSize);
      // 初始化社区信息
      let communities = {};
      subGraph.nodes.forEach((node) => {
        let communityId = node.community;
        if (!communities[communityId]) {
          communities[communityId] = {
            center: null, // 将在后面计算
            nodes: [],
            radius: 0, // 初始化半径
          };
        }
        communities[communityId].nodes.push(node);
      });

      // 计算中心点
      const center = { x: canvasSize.width / 2, y: canvasSize.height / 2 };

      // 计算网格大小
      const mygridSize = Math.ceil(Math.sqrt(Object.keys(communities).length));

      // 计算网格的起始点（左上角）
      const start = {
        x: center.x - ((mygridSize - 1) / 2) * 150,
        y: center.y - ((mygridSize - 1) / 2) * 150,
      };

      // 分配社区圈位置
      Object.keys(communities).forEach((communityId, idx) => {
        // 计算社区圈在网格中的行列位置
        const row = Math.floor(idx / mygridSize);
        const col = idx % mygridSize;

        // 确定社区圈中心点的位置
        const communityCenter = {
          x: start.x + col * 150,
          y: start.y + row * 150,
        };
        let angleDelta = (2 * Math.PI) / communities[communityId].nodes.length;
        communities[communityId].center = communityCenter;
        communities[communityId].nodes.forEach((node, index) => {
          node.x = communityCenter.x + 20 * Math.cos(index * angleDelta); // 这里的 50 是半径大小
          node.y = communityCenter.y + 20 * Math.sin(index * angleDelta);
        });
        let radius = Math.sqrt(communities[communityId].nodes.length) * 20; // 简单估算半径
        communities[communityId].radius = radius;
      });

      // 创建 graphic 圆圈数组
      let communityCircles = Object.values(communities).map((community) => ({
        type: "circle",
        shape: {
          cx: community.center.x,
          cy: community.center.y,
          r: community.radius,
        },
        style: {
          fill: "none",
          stroke: "rgba(255,0,0,0.5)", // 社区边框颜色，这里使用半透明的红色
        },
        // 保证圆圈在节点下方
        z: -1,
      }));

      // 创建图表数据
      let seriesData = [];
      for (let communityId in communities) {
        let nodes = communities[communityId].nodes.map((node) => {
          return {
            name: node.name.toString(),
            x: node.x,
            y: node.y,
            score: node.anomaly_score? node.anomaly_score:0.001,
            symbol: node.symbol, // typeImage 是节点数据中图片的字段
            symbolSize: 20, // 根据实际情况调整大小
            type: node.class,
            info:
              "<br> type: " +
              node.type +
              "<br> country: " +
              node.country +
              "<br> community: " +
              node.community,
          };
        });
        seriesData = seriesData.concat(nodes);
      }

      console.log(communities);
      console.log(seriesData);
      // 配置 ECharts 选项
      let option = {

        tooltip: {
          trigger: "item", // 触发类型应该是 'item'
          triggerOn: "mousemove",
          formatter: function (params) {
            if (params.dataType === "node") {
              // 假设节点数据中包含 id 和其他信息
              return "ID: " + params.data.name + "<br>score: "+params.data.score + params.data.info;
            } else if (params.dataType === "edge") {
              return (
                params.data.source +
                " -> " +
                params.data.target +
                "<br>relation: " +
                params.data.label
              );
            }
          },
        },

        toolbox: {
          show: true,
          feature: {
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        series: [
          {
            type: "graph",
            layout: "none", // 使用节点中的 x 和 y 作为位置
            data: seriesData,
            edges: subGraph.edges.map((edge) => {
              return {
                source: edge.source.toString(),
                target: edge.target.toString(),
                label: edge.label,
              };
            }),
            // 其他配置...
            //节点可以拖动
            draggable: true,
            lineStyle: {
              opacity: 0, // 隐藏边
            },
            label: {
              show: false,
            }
          },
        ],
        graphic: communityCircles,
      };

      myChart.setOption(option);
    });
}


// 在content展示节点的详细信息
var attName = ["betweenness","closeness","degree",
                "company","uncertain","pol_org","location","vessel","event","org","person","movement",
                "owner","fam","memb","in_memb",
                "o_owner","o_part","o_fam","o_memb",
                "in_owner","in_part","in_fam","part",
                "out_dge","in_edge"];

function showInfo(targetNode){
  let content = document.querySelector(".content");
  while (content.hasChildNodes()) {
    content.removeChild(content.lastChild);
  }
  var infoTable = document.createElement("table");
  fetch("./data/classified_feature_vectors.json")
      .then((res) => res.json())
      .then((data) =>{
        let feature_vectors = data[nodeTypeInfo[targetNode]];
        let feature_vector = feature_vectors[targetNode];
        let thead= document.createElement("thead");
        let tbody = document.createElement("tbody");
        
        let th1 = document.createElement("th");
        let th2 = document.createElement("th");
        th1.textContent = "Att";
        th2.textContent = "Value";
        thead.appendChild(th1);
        thead.appendChild(th2);
        let tr1 = document.createElement("tr");
        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        let tr2 = document.createElement("tr");
        let td2_1 = document.createElement("td");
        let td2_2 = document.createElement("td");
        td1.textContent = "id";
        td2.textContent = targetNode;
        tr1.appendChild(td1);
        tr1.appendChild(td2);
        tbody.appendChild(tr1);
        td2_1.textContent = "type";
        td2_2.textContent = nodeTypeInfo[targetNode];
        tr2.appendChild(td2_1);
        tr2.appendChild(td2_2);
        tbody.appendChild(tr2);
        for(let i=3;i<feature_vector.length;++i)
        {
          let tr = document.createElement("tr");
          let td_1 = document.createElement("td");
          let td_2 = document.createElement("td");
          td_1.textContent = attName[i];
          td_2.textContent = feature_vector[i];
          tr.appendChild(td_1);
          tr.appendChild(td_2);
          tbody.appendChild(tr);
        }
        infoTable.appendChild(thead);
        infoTable.appendChild(tbody);

        content.appendChild(infoTable);
      });

}
// 假设您的 HTML 中有一个菜单元素
var customMenu = document.getElementById("custom-menu");

// 阻止图表容器的默认右键菜单
myChart.getDom().addEventListener("contextmenu", function (e) {
  e.preventDefault();
  // 隐藏自定义菜单（如果已经打开）
});

// 右键悬浮菜单
// 添加 ECharts 的右键点击事件监听
myChart.on("contextmenu", function (params) {
  if (params.dataType === "node") {
    // 阻止浏览器默认的右键菜单
    event.preventDefault();
    // 设置自定义菜单的位置并显示它
    customMenu.style.top = event.pageY + "px";
    customMenu.style.left = event.pageX + "px";
    customMenu.style.display = "block";
    foucsNode = params.data.name;
    targetInfor["type"] = params.data.class;
  }
});

// 监听点击事件，如果点击的不是菜单则关闭菜单
document.addEventListener("click", function (e) {
  if (!customMenu.contains(e.target)) {
    customMenu.style.display = "none";
  }
});

// 现在，您需要为每个菜单项添加点击事件
var menuItems = customMenu.querySelectorAll("li");
menuItems.forEach(function (item) {
  item.addEventListener("click", function (e) {
    var action = this.getAttribute("data-action");
    // 根据点击的菜单项执行操作
    // 例如:
    console.log("执行操作：", action);
    // 关闭菜单
    if (action == "foucs") {
      targetNode = foucsNode;
      delete netCorelist;
      netCorelist = new Set();
      netCorelist.add(targetNode);
      renderNet(targetNode);
    } else if (action == "expand") {
      netCorelist.add(foucsNode);
      renderNet(targetNode);
    } else if (action == "labelIllegal") {
      //添加非法节点
      addIllegal(foucsNode);
    } else if (action == "labellegal") {
      //添加明确为合法节点的节点
      addLegal(foucsNode);
    } else if (action == "group") {
      cluster(targetNode);
    } else if (action == "info") {
      showInfo(foucsNode);
    }

    customMenu.style.display = "none";
  });
});

//切换树图
function shiftToTree() {
  renderTree(targetNode);
}

function shiftToNet() {
  renderNet(targetNode);
}

var targetNode = "8327";
//记录当前节点的信息，当且仅当没有对应的所有权流树中使用
var targetInfor = { "type": "organization" };
var foucsNode = "8327";
var netCorelist = new Set();
netCorelist.add(targetNode);
var edgeTypeList = new Set();
var nodeTypeList = new Set();
var content = document.querySelector(".content");

categories.forEach((value, index) => {
  edgeTypeList.add(value);
});

nodeTypes.forEach((value, index) => {
  nodeTypeList.add(value);
});

// 获取输入框元素
var nodeInput = document.querySelector("#nodeInput");
var illegalchose = document.querySelector("#myInput");
// 添加事件监听器
nodeInput.addEventListener("change", function () {
  // 输出输入框的值到控制台
  console.log(nodeInput.value);
  targetNode = nodeInput.value;
  switch (viewOption) {
    case 1:
      delete netCorelist;
      netCorelist = new Set();
      netCorelist.add(targetNode);
      renderNet(targetNode);
      break;
    case 2:
      renderParallel(targetNode);
      break;
    case 3:
      renderTree(targetNode);
      break;
    default:
      renderNet(targetNode);
      break;
  }
});

illegalchose.addEventListener("change", function () {
  // 输出输入框的值到控制台
  console.log(illegalchose.value);
  targetNode = illegalchose.value;
  switch (viewOption) {
    case 1:
      delete netCorelist;
      netCorelist = new Set();
      netCorelist.add(targetNode);
      renderNet(targetNode);
      break;
    case 2:
      renderParallel(targetNode);
      break;
    case 3:
      renderTree(targetNode);
      break;
    default:
      renderNet(targetNode);
      break;
  }
});

var egoView = document.getElementById("ego");
egoView.addEventListener("click", () => {
  viewOption = 1;
  netCorelist = new Set();
  netCorelist.add(targetNode);
  shiftToNet();
  console.log(targetNode);
});

var treeView = document.getElementById("hie");
treeView.addEventListener("click", () => {
  viewOption = 3;
  shiftToTree();
});

var searchSubmit = document.getElementById("searchInput");
searchSubmit.addEventListener("change", () => {
  if (viewOption == 3) {
    console.log(searchSubmit.value);
    theNode = searchSubmit.value;
    searchAndFocus(theNode);
  }
});

var filtEdgeType = document.querySelector("#edgeFilterBtn");
filtEdgeType.addEventListener("click", () => {
  //获取所有被checked的边类型
  // 获取ID为filtEdge的select元素
  let selectEdgeType = document.getElementById('filtEdge');
  let selectNodeType = document.getElementById('filtNode');
  // 获取选中的选项
  let EdgeTypeValues = Array.from(selectEdgeType.selectedOptions).map(option => option.value);
  let NodeTypeValues = Array.from(selectNodeType.selectedOptions).map(option => option.value);
  delete edgeTypeList;
  delete nodeTypeList;
  edgeTypeList = new Set();
  nodeTypeList = new Set();

  EdgeTypeValues.forEach((value) => {
    if (value != "all") {
      edgeTypeList.add(value);
    }
  });

  NodeTypeValues.forEach((value) => {
    if (value != "all") {
      nodeTypeList.add(value);
    }
  });
  // 输出到控制台
  console.log(NodeTypeValues);
  console.log(EdgeTypeValues);

  renderNet(targetNode);
});

// 默认egoNet
shiftToNet();



//实现平行坐标系
function renderParallel(targetNode) {
  var searchInTree = document.querySelector("#searchInput");
      searchInTree.style.display = "none";

  // 以下是您的数据处理部分
  fetch("./data/classified_feature_vectors.json")
    .then(response => response.json())
    .then((data) => {
      // 去除targetNode对应的type的所有特征向量用于绘制
      console.log(nodeTypeInfo);
      // 转换所有特征向量
      let targetNodeType = nodeTypeInfo[targetNode];
      if(targetNodeType == undefined)
          targetNodeType = targetInfor['type'];
      let featureVectors = data[targetNodeType];
      let normallinstyle = {
        color:"#00ff",               //颜色，'rgb(128, 128, 128)'，'rgba(128, 128, 128, 0.5)'，支持线性渐变，径向渐变，纹理填充
                // shadowColor:"yellow",          //阴影颜色
                // shadowOffsetX:1,            //阴影水平方向上的偏移距离。
                // shadowOffsetY:2,            //阴影垂直方向上的偏移距离
                // shadowBlur:10,              //图形阴影的模糊大小。
                type:"solid",               //坐标轴线线的类型，solid，dashed，dotted
                width:1,                    //坐标轴线线宽
                opacity:0.5,                  //图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形
      };

      var targetinstyle = {
        color:"#00ff00",               //颜色，'rgb(128, 128, 128)'，'rgba(128, 128, 128, 0.5)'，支持线性渐变，径向渐变，纹理填充
                // shadowColor:"red",          //阴影颜色
                // shadowOffsetX:1,            //阴影水平方向上的偏移距离。
                // shadowOffsetY:2,            //阴影垂直方向上的偏移距离
                // shadowBlur:10,              //图形阴影的模糊大小。
                type:"solid",               //坐标轴线线的类型，solid，dashed，dotted
                width:3,                    //坐标轴线线宽
                opacity:1,                  //图形透明度。支持从 0 到 1 的数字，为 0 时不绘制该图形
      }
      var lineClass = ["targetNode", "otherNodes"];
      console.log(targetNode);
      myseries = [];
      console.log(featureVectors);
      for (var key in featureVectors) {
        if (featureVectors.hasOwnProperty(key)) {
          nodeline = {};
          nodeline.name = key;
          nodeline.data = [featureVectors[key]];
          nodeline.type = "parallel";
          if(key === targetNode)
            {
              nodeline.lineStyle = targetinstyle;
              nodeline.z = 300;
            }
          else
            nodeline.lineStyle = normallinstyle;
          myseries.push(nodeline);
        }
      }
      var parallelAxis = [{'dim': 0, 'name': 'betweenness',nameRotate:60,max:0.1},
      {'dim': 1, 'name': 'closeness',nameRotate:60,max:0.2},
      {'dim': 2, 'name': 'degree',nameRotate:60,max:0.1},
      {'dim': 3, 'name': 'org',nameRotate:60},
      {'dim': 4, 'name': '?',nameRotate:60},
      {'dim': 5, 'name': 'person',nameRotate:60},
      {'dim': 6, 'name': 'event',nameRotate:60},
      {'dim': 7, 'name': 'company',nameRotate:60},
      {'dim': 8, 'name': 'location',nameRotate:60},
      {'dim': 9, 'name': 'pol_org',nameRotate:60},
      {'dim': 10, 'name': 'vessel',nameRotate:60},
      {'dim': 11, 'name': 'movement',nameRotate:60},
      {'dim': 12, 'name': 'owner',nameRotate:60},
      {'dim': 13, 'name': 'partner',nameRotate:60},
      {'dim': 14, 'name': 'family',nameRotate:60},
      {'dim': 15, 'name': 'member',nameRotate:60},
      {'dim': 16, 'name': 'out_own',nameRotate:60},
      {'dim': 17, 'name': 'out_par',nameRotate:60},
      {'dim': 18, 'name': 'out_fam',nameRotate:60},
      {'dim': 19, 'name': 'out_mem',nameRotate:60},
      {'dim': 20, 'name': 'in_own',nameRotate:60},
      {'dim': 21, 'name': 'in_par',nameRotate:60},
      {'dim': 22, 'name': 'in_fam',nameRotate:60},
      {'dim': 23, 'name': 'in_mem',nameRotate:60},
      {'dim': 24, 'name': 'inEdgeNum',nameRotate:60,max:300},
      {'dim': 25, 'name': 'outEdgeNum',nameRotate:60,max:200}]
    var option = {
        tooltip: {
          trigger: 'item', // 触发类型设为 'item'，响应特定数据项
          padding: 10,
          backgroundColor: '#fff',
          borderColor: '#777',
          borderWidth: 1,
       },
       toolbox: {
        show: true,
        feature: {
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      backgroundColor: "white",
        focusNodeAdjacency: true,
        parallelAxis: parallelAxis,
        parallel: {
          left: '10',
          right: '30',
          bottom: 100,
          parallelAxisDefault: {
            // type: 'value',
            // name: 'AQI指数',
            // nameLocation: 'end',
            // nameGap: 20,
            max: 1.0,
            min: -0.01,
            nameTextStyle: {
              color: '#000',
              fontSize: 12
            },
            triggerEvent:true,
            axisLine: {
              lineStyle: {
                color: '#000'
              }
            },
            axisTick: {
              lineStyle: {
                color: '#000'
              }
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              color: '#000'
            }
          }
        },
        series: myseries,
    };

    myChart.setOption(option,{ notMerge: true });


    })
    .catch(error => console.error(error));
}

var parallel = document.querySelector("#Parallel");
parallel.addEventListener("click", () => {
  viewOption = 2;
  renderParallel(targetNode);
});


var dropdown = document.getElementById("illegalNodelist");
  fetch("./data/sorted_rounded_node_scores.json")
    .then(response => response.json())
    .then((data) =>{
      const sortedEntries = Object.entries(data)
      .sort((a, b) => b[1] - a[1]); // 根据值（value）降序排列
  
      const sortedFruits = sortedEntries.map(entry => entry[0]);
      console.log(sortedFruits);
      for(let i=0;i<100;++i)
      {
        let node = sortedFruits[i];
        var option = document.createElement('option');
        option.text = `异常值得分：${data[node]}`;
        option.value = node;
        dropdown.appendChild(option);
      }
    });


