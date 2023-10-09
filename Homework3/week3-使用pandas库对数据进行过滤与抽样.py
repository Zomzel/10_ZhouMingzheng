import numpy as np
import pandas as pd

# 读取csv文件
data = pd.read_csv('test.csv')
df = pd.DataFrame(data)

# 过滤
condition_1 = data['traffic'] != 0
condition_2 = data['from_level'] == '一般节点'
filtered_data = data[condition_1 & condition_2]

filtered_data.to_csv('filtered_data.csv', index=False)


# 抽样
# 加权抽样
# 定义权重列，一般节点权重为1，网络核心权重为5
weights = df['to_level'].map({'一般节点': 1, '网络核心': 5})

# 采样比例20%，random_state为随机种子
sample_1 = df.sample(frac=0.2, weights=weights, random_state=42)
sample_1.to_csv('weighted_sampling.csv', index=False)


# 分层采样
# 设置分层抽样的层级列
stratify_by = 'to_level'
# 定义抽样函数
def stratified_sample(data):
    return data.sample(frac=0.2, random_state=42)

# groupby按照层级列进行分组，并使用apply方法应用采样函数
sample_2 = df.groupby(stratify_by, group_keys=False).apply(stratified_sample)
sample_2.to_csv('stratified_sampling.csv', index=False)


# 随机抽样
sample_3 = df.sample(frac=0.2, random_state=42)
sample_3.to_csv('random_sampling.csv', index=False)


# 系统抽样
step = 5
def systematic_sampling(df, step):
    # 创建索引数组，包含了以0开始、以len(df结束)，步长为step的索引
    indexes = np.arange(0, len(df), step=step)
    sample_4 = df.iloc[indexes]
    return sample_4

sample_4 = systematic_sampling(df, step)
sample_4.to_csv('systematic_sampling.csv', index=False)


# 整群抽样
def cluster_sample(data):
    return data.sample(n=1, random_state=42) # 从每个群组中随机选择一个样本

# 按照to_city列的值进行分组，然后应用抽样函数
sample_5 = df.groupby('to_city').apply(cluster_sample)
sample_5.to_csv('cluster_sampling.csv', index=False)
