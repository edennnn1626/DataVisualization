async function createLineChartMonthly(containerId = "#lineChartMonthly") {
    try {
        const rawData = await d3.csv("MonthlyFines.csv", d => ({
            START_DATE: d.START_DATE,
            JURISDICTION: d.JURISDICTION,
            FINES: +d.FINES,
            YEAR: +d.YEAR,
            Month: +d.Month
        }));

        const years = Array.from(new Set(rawData.map(d => d.YEAR))).sort((a, b) => a - b);

        const dropdown = d3.select("#yearDropdown");
        dropdown.selectAll("option")
            .data(years)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        let selectedYear = years[0];
        dropdown.property("value", selectedYear);

        dropdown.on("change", function () {
            selectedYear = +this.value;
            updateChart(selectedYear);
        });

        // ------- Build SVG ONCE -------
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

        // Scales
        const x = d3.scaleLinear().domain([1, 12]).range([0, width]);
        const xAxis = svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format("d")));

        const y = d3.scaleLinear().range([height, 0]);
        const yAxis = svg.append("g");

        const lineGenerator = d3.line()
            .x(d => x(d.Month))
            .y(d => y(d.SumFines));

        const linePath = svg.append("path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2);

        const dotsGroup = svg.append("g");

        // Initial draw
        updateChart(selectedYear);

        function updateChart(year) {
            const filtered = rawData.filter(d => d.YEAR === year);

            const monthMap = d3.rollup(
                filtered,
                v => d3.sum(v, d => d.FINES),
                d => d.Month
            );

            const data = Array.from(monthMap, ([Month, SumFines]) => ({
                Month,
                SumFines
            })).sort((a, b) => a.Month - b.Month);

            // Update Y scale
            const yMax = d3.max(data, d => d.SumFines) || 0;
            y.domain([0, yMax * 1.1]).nice();

            // Smooth axis transition
            yAxis.transition().duration(750).call(d3.axisLeft(y));

            // Update line smoothly
            linePath
                .datum(data)
                .transition()
                .duration(750)
                .attr("d", lineGenerator);

            // Update dots smoothly
            const dots = dotsGroup.selectAll("circle")
                .data(data, d => d.Month);

            dots.enter()
                .append("circle")
                .attr("r", 4)
                .attr("fill", "steelblue")
                .merge(dots)
                .transition()
                .duration(750)
                .attr("cx", d => x(d.Month))
                .attr("cy", d => y(d.SumFines));

            dots.exit().remove();
        }

    } catch (error) {
        console.error("Monthly line chart error:", error);
    }
}
