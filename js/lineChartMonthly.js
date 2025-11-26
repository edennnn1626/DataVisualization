async function createLineChartMonthly(containerId = "#lineChartMonthly") {
    try {
        const rawData = await d3.csv("MonthlyFines.csv");

        // Aggregate total fines per month
        const monthMap = d3.rollup(
            rawData,
            v => d3.sum(v, d => +d.FINES),
            d => +d.Month
        );

        const data = Array.from(monthMap, ([Month, SumFines]) => ({
            Month,
            SumFines
        })).sort((a, b) => a.Month - b.Month);

        const margin = { top: 30, right: 40, bottom: 40, left: 70 };
        const width = 600 - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3.select(containerId)
            .html("")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // X scale (months)
        const x = d3.scaleLinear().domain([1, 12]).range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format("d")));

        // Y scale (linear, dynamic)
        const yMax = d3.max(data, d => d.SumFines);
        const y = d3.scaleLinear()
            .domain([0, yMax * 1.1]) // add 10% headroom
            .range([height, 0])
            .nice();

        svg.append("g").call(d3.axisLeft(y));

        // Line generator
        const line = d3.line()
            .x(d => x(d.Month))
            .y(d => y(d.SumFines));

        // Draw line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Tooltip
        const tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("padding", "6px 10px")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("opacity", 0)
            .style("pointer-events", "none");

        // Add dots
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.Month))
            .attr("cy", d => y(d.SumFines))
            .attr("r", 4)
            .attr("fill", "steelblue")
            .on("mouseover", function (event, d) {
                tooltip
                    .style("opacity", 1)
                    .html(`<strong>Month: ${d.Month}</strong><br>Total Fines: ${d.SumFines}`);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY - 30 + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
            });
        // X-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .text("Month")
            .style("font-size", "14px")
            .style("font-weight", "bold");
        // Y-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${-50}, ${height / 2}) rotate(-90)`)
            .text("Total Fines")
            .style("font-size", "14px")
            .style("font-weight", "bold");
    } catch (error) {
        console.error("Monthly line chart error:", error);
    }
}