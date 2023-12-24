"""
绘制hierarchy层级树状图
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from collections import defaultdict
from pyecharts import options as opts
from pyecharts.charts import Tree
import json

# postings用于记录每一个节点的孩子节点，构建方式类似倒排索引
postings = defaultdict(dict)

# 导入数据
data1 = pd.read_csv('./data/nodes.csv')
data2 = pd.read_csv('./data/links.csv')

nodes = pd.DataFrame(data1)
links = pd.DataFrame(data2)

# 创建关于节点的字典，便于遍历提取元素，数据为键值对(id,type)
nodes_dict = {}

nodes.fillna('uncertain', inplace=True)
links.fillna('uncertain', inplace=True)

# 去除重复的行
links.drop_duplicates(inplace=True)
nodes.drop_duplicates(inplace=True)

for index, row in nodes.iterrows():
    if row['id'] not in nodes_dict.keys():
        nodes_dict[row['id']] = row['type']

typeImg = {
    'company': './img/公司.png',
    'organization': './img/组织.png',
    'person': './img/个人.png',
    'location': './img/定位.png',
    'political_organization': './img/政治组织.png',
    'vessel': './img/轮船.png',
    'movement': './img/移动.png',
    'event': './img/事件.png',
    'uncertain': './img/未知.png'
}

sImg = {
    'company': './img/s公司.png',
    'organization': './img/s组织.png',
    'person': './img/s个人.png',
    'location': './img/s定位.png',
    'political_organization': './img/s政治组织.png',
    'vessel': './img/s轮船.png',
    'movement': './img/s移动.png',
    'event': './img/s事件.png',
    'uncertain': './img/s未知.png'
}

# 定义可疑节点
suspect_node = ['Mar de la Vida OJSC', '979893388', 'Oceanfront Oasis Inc Carriers', '8327']
# 根据ownership绘制hierarchy层级树状图
# 提取ownership边
ownership = links[links['type'] == "ownership"].drop(['Unnamed: 0', 'dataset', 'type', 'key'], axis=1)
# print(ownership.head(5))
hie = list(set(ownership['source']).union(set(ownership['target'])))
hieNodes = nodes[nodes['id'].isin(hie)].drop(['Unnamed: 0', 'dataset', 'country'], axis=1)

ownershipNodes = hieNodes.apply(lambda x: x.to_dict(), axis=1).tolist()
ownershipLinks = ownership.apply(lambda x: x.to_dict(), axis=1).tolist()



graph = {}

graph['nodes'] = ownershipNodes
graph['links']=ownershipLinks
# with open('./data/graph.json', 'w') as f:
#    json.dump(graph, f)

# 计算hieNodes的出度和入度
indegree = {}
outdegree = {}
degree = {}

# for index, row in ownership.iterrows():
#     if row['target'] in indegree.keys():
#         indegree[row['target']] += 1
#     else:
#         indegree[row['target']] = 1
#     if row['target'] in degree.keys():
#         degree[row['target']] += 1
#     else:
#         degree[row['target']] = 1
#     if row['source'] in outdegree.keys():
#         indegree[row['source']] += 1
#     else:
#         indegree[row['source']] = 1
#     if row['source'] in degree.keys():
#         degree[row['source']] += 1
#     else:
#         degree[row['source']] = 1

# 统计每一个节点的孩子节点

# 进一步简化，排除event，location，movement
leaveOut = ["event", "location", "movement"]
for index, row in ownership.iterrows():
    if (nodes_dict[row['source']] not in leaveOut) and (nodes_dict[row['target']] not in leaveOut):
        if row['source'] in postings.keys():
            if row['target'] in postings[row['source']].keys():
                postings[row['source']][row['target']] += 1
            else:
                postings[row['source']][row['target']] = 1
        else:
            postings[row['source']] = {}
            postings[row['source']][row['target']] = 1


# print(postings)
# 每一个节点的孩子节点有了，如何绘制树状图？

# 递归建树
# 假设你的树状结构数据存储在名为 tree_dict 的字典中
def build_tree_dict(data, root, visited, true_root, num):
    tree_dict = {"name": root, "type": nodes_dict[root], "times": num}
    visited[root] = 1

    children = data.get(root, {})
    for child in children.keys():
        if child not in visited.keys():
            subtree = build_tree_dict(data, child, visited, true_root, children[child])
            if "children" not in tree_dict.keys():
                tree_dict["children"] = [subtree]
            else:
                tree_dict["children"].append(subtree)
        else:
            visited[child] += 1
            if child == true_root:
                subtree = {"name": child + "_" + str(visited[child]), "type": nodes_dict[child], "times": children[child], "suspected": True}
            else:
                subtree = {"name": child + "_" + str(visited[child]), "type": nodes_dict[child], "times": children[child]}
            if "children" not in tree_dict.keys():
                tree_dict["children"] = [subtree]
            else:
                tree_dict["children"].append(subtree)

    return tree_dict


trees = {}

for index, row in hieNodes.iterrows():
    visited = {}
    tree = build_tree_dict(postings, row['id'], visited, row['id'], 1)
    trees[row['id']] = tree

# 将层级树导出为json文件
with open("./data/hieFormatted.json", "w", encoding="utf-8") as f:
    json.dump(trees, f, ensure_ascii=False, indent=4)

print(trees['979893388'])
# # 指定根节点
# root_node = '8327'
# vis = set()
# # 构建树状字典
# tree_structure = [build_tree_dict(postings, root_node, vis)]
#
# print(tree_structure)
#
# # 遍历树，删除空的键值对
#
# c = (
#     Tree()
#     .add("", tree_structure)
#     .set_global_opts(title_opts=opts.TitleOpts(title="Tree-基本示例"))
#     .render("hieNet.html")
# )

# # 指定根节点
# root_node2 = 'Mar de la Vida OJSC'
# vis2 = set()
# # 构建树状字典
# tree_structure2 = [build_tree_dict(postings, root_node2, vis2)]
#
# print(tree_structure2)
#
# # 遍历树，删除空的键值对
#
# c2 = (
#     Tree()
#     .add("", tree_structure2)
#     .set_global_opts(title_opts=opts.TitleOpts(title="Tree-基本示例"))
#     .render("hieNet2.html")
# )

# 指定根节点
# root_node3 = '40213337'
# vis3 = set()
# # 构建树状字典
# tree_structure3 = [build_tree_dict(postings, root_node3, vis3)]
#
# print(tree_structure3)
#
# # 遍历树，删除空的键值对
#
# c3 = (
#     Tree()
#     .add("", tree_structure3)
#     .set_global_opts(title_opts=opts.TitleOpts(title="Ownership"),
#                      tooltip_opts=opts.TooltipOpts(trigger="item", trigger_on="mousemove"),
#                      )
#     .render("hieNet5.html")
# )

# # 指定根节点
# root_node4 = 'Oceanfront Oasis Inc Carriers'
# vis4 = set()
# # 构建树状字典
# tree_structure4 = [build_tree_dict(postings, root_node4, vis4)]
#
# print(tree_structure4)
#
# # 遍历树，删除空的键值对
#
# c4 = (
#     Tree()
#     .add("", tree_structure4)
#     .set_global_opts(title_opts=opts.TitleOpts(title="Tree-基本示例"))
#     .render("hieNet4.html")
# )
