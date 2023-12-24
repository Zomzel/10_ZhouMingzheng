import pandas as pd

nodes = pd.read_csv("nodes.csv")


# 创建一个函数来标识可疑节点
def label_suspect(node_id):
    suspect_node = ['Mar de la Vida OJSC', '979893388', 'Oceanfront Oasis Inc Carriers', '8327']
    if node_id in suspect_node:
        return 1
    else:
        return 0


# 使用 'apply' 函数和上面定义的函数给 'id' 列的每一个元素打标签
nodes['label'] = nodes['id'].apply(label_suspect)

# 提取 label 列
labels = nodes[['label']]

# 将 label 列保存为新的 CSV 文件
labels.to_csv('labels.csv', index=False)
