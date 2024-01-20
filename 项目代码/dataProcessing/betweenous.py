import networkx as nx
import pandas as pd
import numpy as np
import json


def load_data():
    nodes = pd.read_csv('./data/nodes.csv')
    links = pd.read_csv('./data/links.csv')

    # 填充缺失值
    nodes.fillna('uncertain', inplace=True)
    links.fillna('uncertain', inplace=True)
    return nodes, links


def build_graph(nodes, links):
    # 创建网络图
    G = nx.DiGraph()
    for index, row in nodes.iterrows():
        nodeid = row['id']
        G.add_node(nodeid, attributes=row.to_dict())
    for index, row in links.iterrows():
        G.add_edge(row['source'], row['target'], weight=row['weight'])
    return G


[nodes, links] = load_data()
G = build_graph(nodes, links)
# 计算节点的度中心性
degree_centrality = nx.degree_centrality(G)

# 计算节点的介数中心性
betweenness_centrality = nx.betweenness_centrality(G)

# 计算节点的接近中心性
closeness_centrality = nx.closeness_centrality(G)

a1_id = betweenness_centrality.keys()
a1_val = betweenness_centrality.values()
a2_id = closeness_centrality.keys()
a2_val = closeness_centrality.values()
a3_id = degree_centrality.keys()
a3_val = degree_centrality.values()

a1 = pd.DataFrame({'id': a1_id, 'betweenness': a1_val})
a2 = pd.DataFrame({'id': a2_id, 'betweenness': a2_val})
a3 = pd.DataFrame({'id': a3_id, 'betweenness': a3_val})



with open("./data/betweenness_centrality.json", "w", encoding="utf-8") as f:
    json.dump(betweenness_centrality, f, ensure_ascii=False, indent=4)
with open("./data/closeness_centrality.json", "w", encoding="utf-8") as f:
    json.dump(closeness_centrality, f, ensure_ascii=False, indent=4)
with open("./data/degree_centrality.json", "w", encoding="utf-8") as f:
    json.dump(degree_centrality, f, ensure_ascii=False, indent=4)

# 打印节点的中心性度量
for node_id in G.nodes():
    print(f"节点 {node_id}:")
    print(f"度中心性: {degree_centrality[node_id]:.4f}")
    print(f"介数中心性: {betweenness_centrality[node_id]:.4f}")
    print(f"接近中心性: {closeness_centrality[node_id]:.4f}")
    print("\n")



