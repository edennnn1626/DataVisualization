async function createLineChart(containerSelector = null) {
    const target = containerSelector || (document.getElementById('lineChart') ? '#lineChart' : '#chart');

    // Load CSV data
    const data = await d3.csv("AnnualFinesFromSpeeding.csv", d => ({
        method: d.DETECTION_METHOD,
        year: +d.YEAR,
        value: +d["Sum(FINES)"],
        date: new Date(+d.YEAR, 0, 1)
    }));

    // Group data by detection method
    const methods = Array.from(d3.group(data, d => d.method), ([key, values]) => ({ method: key, values }));

    // Set chart dimensions
    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select(target).selectAll("*").remove();

    const svg = d3.select(target)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X and Y scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(",")));

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(methods.map(d => d.method));

    // Line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    // Draw lines
    svg.selectAll(".line")
        .data(methods)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .style("stroke", d => color(d.method))
        .style("fill", "none")
        .style("stroke-width", 2);

    // Draw dots
    methods.forEach(m => {
        svg.selectAll(`.dot-${m.method.replace(/\s+/g, '')}`)
            .data(m.values)
            .enter()
            .append("circle")
            .attr("class", `dot dot-${m.method.replace(/\s+/g, '')}`)
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.value))
            .attr("r", 4)
            .style("fill", color(m.method));
    });

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("circle")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 6);

            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Method: ${d.method}<br/>Year: ${d.year}<br/>Fines: ${d3.format(",")(d.value)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 4);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Legend
    const legend = svg.selectAll(".legend")
        .data(methods)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 20},${i * 25})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d.method));

    legend.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .text(d => d.method);
}
