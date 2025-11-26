async function createPieChartDetection(containerId = "#pieChartDetection") {
    try {
        const data = await d3.csv("DetectionMethodFines.csv");

        // Convert fines to numbers
        data.forEach(d => {
            d.SumFines = +d["Sum(FINES)"];
        });

        const width = 500;   // bigger chart
        const height = 450;
        const radius = Math.min(width, height) / 2;

        const svg = d3
            .select(containerId)
            .append("svg")
            .attr("width", width + 150)   // extra space for legend
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const pie = d3.pie().value(d => d.SumFines);
        const data_ready = pie(data);

        const arc = d3.arc().innerRadius(0).outerRadius(radius);

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

        // ❌ REMOVE all labels inside slices
        // (just don't add any text)

        // ✅ ADD LEGEND on the right
        const legend = d3.select(containerId)
            .select("svg")
            .append("g")
            .attr("transform", `translate(${width + 10}, 20)`);

        legend.selectAll("legend-item")
            .data(data)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 22})`)
            .each(function (d) {
                const g = d3.select(this);
                g.append("rect")
                    .attr("width", 14)
                    .attr("height", 14)
                    .attr("fill", color(d.DETECTION_METHOD));

                g.append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .style("font-size", "13px")
                    .text(d.DETECTION_METHOD);
            });

    } catch (error) {
        console.error("Pie chart error:", error);
    }
}