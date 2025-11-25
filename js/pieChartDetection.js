async function createPieChartDetection(containerId = "#pieChartDetection") {
    try {
        const data = await d3.csv("DetectionMethodFines.csv");

        // Convert fines to numbers
        data.forEach(d => {
            d.SumFines = +d["Sum(FINES)"];
        });

        const width = 450;
        const height = 450;
        const radius = Math.min(width, height) / 2;

        const svg = d3
            .select(containerId)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const pie = d3.pie().value(d => d.SumFines);
        const data_ready = pie(data);

        const arc = d3.arc().innerRadius(0).outerRadius(radius);

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

        // Draw slices
        svg.selectAll("path")
            .data(data_ready)
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.DETECTION_METHOD))
            .attr("stroke", "#fff")
            .style("stroke-width", "2px")
            .on("mouseover", function (event, d) {
                tooltip
                    .style("opacity", 1)
                    .html(
                        `<strong>${d.data.DETECTION_METHOD}</strong><br>Fines: ${d.data.SumFines}`
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

        // Labels
        svg.selectAll("text")
            .data(data_ready)
            .enter()
            .append("text")
            .text(d => d.data.DETECTION_METHOD)
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .style("text-anchor", "middle")
            .style("font-size", "11px");

    } catch (error) {
        console.error("Pie chart error:", error);
    }
}