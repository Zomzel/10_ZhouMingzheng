import pandas as pd
import json

# Load the data
data_path = './data/nodes_with_att2.csv'  # Update this to your CSV file path
nodes_data = pd.read_csv(data_path)

# Select columns for parallel coordinates (excluding 'Unnamed: 0', 'dataset', 'country', 'id')
parallel_columns = [col for col in nodes_data.columns if col not in ['Unnamed: 0', 'type', 'dataset', 'country', 'id']]
unique_types = nodes_data['type'].unique().tolist()

# ECharts configuration
dimensions = [{"dim": i, "name": col} for i, col in enumerate(parallel_columns)]
echarts_config = {
    "parallelAxis": dimensions,
    "series": [
        {
            "type": 'parallel',
            "lineStyle": {
                "width": 1,
                "opacity": 0.5
            },
            "emphasis": {
                "lineStyle": {
                    "width": 3,
                    "opacity": 1
                }
            },
            "data": nodes_data[parallel_columns + ['id', 'type']].values.tolist()
        }
    ],
    "tooltip": {
        "trigger": 'item',
        "formatter": 'function (params) { return "ID: " + params.data[params.data.length - 2] + "<br>Type: " + '
                     'params.data[params.data.length - 1]; } '
    }

}


echarts_config_json = json.dumps(echarts_config)

# Dropdown for type selection
dropdown_html = "".join([f"<option value='{t}'>{t}</option>" for t in unique_types])

# Full HTML content
interactive_echarts_html = f"""
<div>
    <select id="typeSelector" onchange="updateChart()">
        <option value="all">All Types</option>
        {dropdown_html}
    </select>
</div>
<div id="main" style="width: 100%;height:600px;"></div>
<script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
<script type="text/javascript">
    var rawData = {json.dumps(nodes_data[parallel_columns + ['id', 'type']].values.tolist())};
    var myChart = echarts.init(document.getElementById('main'));
    var option = {echarts_config_json};

    function updateChart() {{
        var selectedType = document.getElementById('typeSelector').value;
        var filteredData = rawData;
        if (selectedType !== 'all') {{
            filteredData = rawData.filter(function (item) {{
                return item[item.length - 1] === selectedType;
            }});
        }}
        option.series[0].data = filteredData;
        myChart.setOption(option, true);
    }}

    myChart.setOption(option);
</script>
"""

# Save the interactive HTML content to a file
interactive_html_file_path = './data/interactive_parallel_coordinates_chart.html'  # Update this to the desired path
with open(interactive_html_file_path, 'w') as html_file:
    html_file.write(interactive_echarts_html)

# Now you can use the Streamlit components.html function to display this HTML in your app
