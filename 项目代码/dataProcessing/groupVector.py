# 由于之前尝试直接读取数据遇到了技术困难，我们需要换一种方式来处理这个请求。
# 根据用户的要求，我们需要创建一个新的字典，其中每种节点类型对应一个子字典，
# 每个子字典包含该类型所有节点的特征向量键值对。
import json
# 首先，我们需要再次尝试加载这两个文件。
try:
    # 加载特征向量文件
    with open('./data/modified_feature_vectors.json', 'r') as file:
        feature_vectors = json.load(file)

    # 加载图数据文件
    with open('./data/dataFormatted.json', 'r') as file:
        graph_data = json.load(file)

    # 从图数据中提取节点ID和类型信息
    node_type_mapping = {node['name'].lower(): node['type'] for node in graph_data['nodes']}

    # 按类型分组特征向量
    grouped_vectors = {}
    for node_id, vector in feature_vectors.items():
        node_type = node_type_mapping.get(node_id)
        if node_type:
            if node_type not in grouped_vectors:
                grouped_vectors[node_type] = {}
            grouped_vectors[node_type][node_id] = vector

    # 将分组好的特征向量保存为新的JSON文件
    output_file_path = './grouped_feature_vectors.json'
    with open(output_file_path, 'w') as outfile:
        json.dump(grouped_vectors, outfile)

    output_file_path  # 返回文件路径以供下载
except Exception as e:
    error_message = str(e)
    print(error_message)
    error_message

