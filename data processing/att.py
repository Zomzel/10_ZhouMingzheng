import pandas as pd

# 1. 使用pandas库读取CSV文件
nodes = pd.read_csv('./data/nodes.csv')
links = pd.read_csv('./data/links.csv')

nodes.fillna('uncertain', inplace=True)
links.fillna('uncertain', inplace=True)

# 2. 根据`source`和`target`列统计每个节点的邻居
neighbors_dict = {}
for index, row in links.iterrows():
    source = row['source']
    target = row['target']

    # 对于source节点
    # 用set记录邻居，防止邻居被重复计入
    if source not in neighbors_dict:
        neighbors_dict[source] = set()
    neighbors_dict[source].add(target)

    # 对于target节点
    if target not in neighbors_dict:
        neighbors_dict[target] = set()
    neighbors_dict[target].add(source)

# 3. 对于每个节点，统计其邻居的类型数量
type_count_dict = {}
for node, neighbors in neighbors_dict.items():
    type_count = {"company"}
    for neighbor in neighbors:
        node_type = nodes[nodes['id'] == neighbor]['type'].iloc[0]
        type_count[node_type] = type_count.get(node_type, 0) + 1
    type_count_dict[node] = type_count

# 4. 计算每种类型的比例
type_num_dict = {}
for node, type_count in type_count_dict.items():
    total = sum(type_count.values())
    type_num = {k: (v/1)+1 for k, v in type_count.items()}
    type_num_dict[node] = type_num

# 5. 将这些信息添加到`nodes.csv`中的新列
for node_type in nodes['type'].unique():
    nodes[node_type + '_num'] = 0
    for node, type_num in type_num_dict.items():
        if node_type in type_num:
            nodes.loc[nodes['id'] == node, node_type + '_num'] = type_num[node_type]

# 保存更新后的nodes.csv
# nodes.to_csv('nodes_updated.csv', index=False)



# 统计每一个节点关联的边的类型的数量
# 1. 创建一个字典来存储每个节点关联的边的类型数量。
edge_type_dict = {}

# 初始化
for node in nodes['id']:
    edge_type_dict[node] = {}

# 2. 遍历links.csv中的每一行，对于每条边，更新对应节点的边类型数量。
for index, row in links.iterrows():
    edge_type = row['type']
    source = row['source']
    target = row['target']

    # 更新source节点的边类型数量
    edge_type_dict[source][edge_type] = edge_type_dict[source].get(edge_type, 0) + 1

    # 更新target节点的边类型数量（因为边是有向的）
    edge_type_dict[target][edge_type] = edge_type_dict[target].get(edge_type, 0) + 1

# 3. 使用该信息为nodes.csv中的每个节点计算每种类型的比例。
for node_id, types in edge_type_dict.items():
    total_edges = sum(types.values())
    for edge_type, count in types.items():
        edge_type_dict[node_id][edge_type] = (count / 1)+1

# 4. 将比例作为新列添加到nodes.csv中。
for edge_type in links['type'].unique():
    nodes[edge_type + '_num'] = nodes['id'].apply(lambda x: edge_type_dict.get(x, {}).get(edge_type, 0))

# 保存更新后的nodes.csv
# nodes.to_csv('updated_nodes.csv', index=False)


# 统计每一个节点关联的边的总权重

# 创建一个字典来存储每个节点关联的边的总权重
weight_dict = {}

# 初始化
for node in nodes['id']:
    weight_dict[node] = 0

# 遍历links.csv的每一行，累加每个节点的相关权重
for index, row in links.iterrows():
    weight = row['weight']
    source = row['source']
    target = row['target']

    # 为源节点和目标节点累加权重
    weight_dict[source] += weight
    weight_dict[target] += weight

# 将总权重作为新列添加到nodes.csv中
nodes['total_weight'] = nodes['id'].apply(lambda x: weight_dict.get(x, 0))

# # 保存更新后的nodes.csv
nodes.to_csv('./data/nodes_with_att2.csv', index=False)

filtedDate = nodes.drop(['Unnamed: 0', 'dataset', 'country'], axis=1)

filtedDate.to_csv('./data/att_filed.csv')


# 6. 应用独热编码
df_encoded = pd.get_dummies(nodes, columns=['type', 'country'])

# 将布尔类型的数据转换成0和1
# df_encoded = df_encoded*1
#
# sub_df = df_encoded.iloc[:, 3:]
#
# # 提取value数组
# attributes = sub_df.values
#
# att = pd.DataFrame(attributes)
#
# # 保存为属性集CSV
# att.to_csv('att.csv', header=False, index=False)


# # 创建一个函数来标识可疑节点
# def label_suspect(node_id):
#     suspect_node = ['Mar de la Vida OJSC', '979893388', 'Oceanfront Oasis Inc Carriers', '8327']
#     if node_id in suspect_node:
#         return 1
#     else:
#         return 0
#
# # 使用 'apply' 函数和上面定义的函数给 'id' 列的每一个元素打标签
# nodes['label'] = nodes['id'].apply(label_suspect)
#
# # 提取 label 列
# labels = nodes[['label']]
#
# # 将 label 列保存为新的 CSV 文件
# labels.to_csv('labels.csv', index=False)




