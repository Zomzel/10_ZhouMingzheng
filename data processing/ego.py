from pyecharts.charts import Tree
from pyecharts import options as opts

# 创建树状图实例
tree = Tree()

# 设置树状图的全局配置
tree.set_global_opts(
    title_opts=opts.TitleOpts(title="树状图示例"),
    legend_opts=opts.LegendOpts(selected_mode="single")
)

# 构建树状图的数据
data = [
    {
        "name": "公司 A",
        "itemStyle": {"color": "#ff7f50"},
        "children": [
            {
                "name": "个人 A",
                "itemStyle": {"color": "#1e90ff"}
            },
            {
                "name": "组织 A",
                "itemStyle": {"color": "#32cd32"},
                "children": [
                    {
                        "name": "轮船 A",
                        "itemStyle": {"color": "#9370db"}
                    },
                    {
                        "name": "轮船 B",
                        "itemStyle": {"color": "#9370db"}
                    }
                ]
            }
        ]
    }
]

# 添加数据到树状图
tree.add("", data)

# 获取图例信息
legend_data = ["公司 A", "个人 A", "组织 A", "轮船 A", "轮船 B"]

# 设置图例数据
tree.set_series_opts(legend_opts=opts.LegendOpts(legend_data))

# 保存树状图为HTML文件
tree.render("tree_chart_with_legend.html")
