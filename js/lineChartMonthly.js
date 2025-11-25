async function createLineChartMonthly(containerId = "#lineChartMonthly") {
    try {
        const data = await d3.csv("MonthlyFines.csv");

        data.forEach(d => {
            d.Month = +d.Month;
            d.SumFines = +d["Sum(FINES)"];
        });

        const margin = { top: 30, right: 40, bottom: 40, left: 70 };
        const width = 600 - margin.left - margin.right;
        const height = 350 - margin.top - margin.bottom;

        const svg = d3
            .select(containerId)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // X scale (month 1–12)
        const x = d3.scaleLinear().domain([1, 12]).range([0, width]);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(12));

        // Y scale (log)
        const y = d3.scaleLog()
            .domain([d3.min(data, d => d.SumFines), d3.max(data, d => d.SumFines)])
            .range([height, 0])
            .nice();

        svg.append("g").call(d3.axisLeft(y));

        // Line generator
        const line = d3
            .line()
            .x(d => x(d.Month))
            .y(d => y(d.SumFines));

        // Draw line
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Tooltip div
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
                    .html(
                        `<strong>Month: ${d.Month}</strong><br>Fines: ${d.SumFines}`
                    );
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", event.pageX + 15 + "px")
                    .style("top", event.pageY - 30 + "px");
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
            });

    } catch (error) {
        console.error("Monthly line chart error:", error);
    }
}