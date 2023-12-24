import json
import numpy as np

# 1. 从JSON文件加载数据
with open('./data/classified_feature_vectors.json', 'r') as json_file:
    data = json.load(json_file)

# 2. 提取组织类型的节点特征向量
organization_data = {}
for node_id, feature_vector in data['organization'].items():
    organization_data[node_id] = feature_vector

# 3. 计算平均特征向量和标准差向量
all_feature_vectors = np.array(list(organization_data.values()))
mean_vector = np.mean(all_feature_vectors, axis=0)
std_vector = np.std(all_feature_vectors, axis=0)

# 4. 计算每个节点的Z-得分
z_scores = {}
for node_id, feature_vector in organization_data.items():
    # 计算节点特征向量与平均向量的距离
    distance_vector = np.abs(feature_vector - mean_vector)

    # 用标准差向量的模进行归一化
    normalized_distance = distance_vector / std_vector

    # 计算Z-得分
    z_score = np.sqrt(np.sum(normalized_distance ** 2))

    z_scores[node_id] = z_score

# 5. 将结果保存为JSON文件
result_filename = 'organization_z_scores.json'
with open(result_filename, 'w') as result_file:
    json.dump(z_scores, result_file, indent=4)

print(f"Z-scores for organization nodes saved to '{result_filename}'.")
