"""
//构造邻接矩阵，用于模型训练
"""
import pandas as pd
import numpy as np

# 读取数据
nodes_df = pd.read_csv("./data/nodes.csv")
links_df = pd.read_csv("./data/links.csv")

# 获取节点数量
num_nodes = len(nodes_df)

# 创建邻接矩阵
adj_matrix = np.eye(num_nodes)

# 遍历每个边并更新邻接矩阵
for index, row in links_df.iterrows():
    source_idx = nodes_df[nodes_df['id'] == row['source']].index[0]
    target_idx = nodes_df[nodes_df['id'] == row['target']].index[0]
    adj_matrix[source_idx, target_idx] += 1

# 将邻接矩阵转换为pandas DataFrame
adj_df = pd.DataFrame(adj_matrix)

# 采用随机游走重启策略获取更丰富的上下文来重建X
def compute_matrix_P(A, t, r=0.3):
    n = A.shape[0]
    # 计算D的逆矩阵
    D = np.diag((np.sum(A, axis=1)))
    D_inv = np.linalg.inv(D)
    # 计算转移矩阵
    M = np.dot(D_inv, A)
    # 初始化P0为对角矩阵
    P0 = np.eye(n)
    # 存储所有的Pt矩阵
    P_list = [P0]
    # 根据给定的公式计算Pt矩阵
    for _ in range(t):
        Pt = r * np.dot(P_list[-1], M) + (1 - r) * P0
        P_list.append(Pt)
    # 从P1开始计算平均值
    X = np.mean(P_list[1:], axis=0)

    return X


t = 3
X = compute_matrix_P(adj_matrix, t)

# 保存为csv
df = pd.DataFrame(X)
df.to_csv("matrix_X.csv", index=False, header=False)

# # 保存为CSV文件
# adj_df.to_csv("adjacency_matrix.csv", index=False, header=False)
