async function createLineChartJurisdiction(containerSelector = null) {
    const target = containerSelector || (document.getElementById('lineChart') ? '#lineChart' : '#chart');

    // Load CSV data
    const data = await d3.csv("AnnualFinesFromJurisdiction.csv", d => ({
        jurisdiction: d.JURISDICTION,
        year: +d.YEAR,
        value: +d["Sum(FINES)"],
        date: new Date(+d.YEAR, 0, 1) // convert year to Date for X scale
    }));

    // Group data by jurisdiction
    const jurisdictions = Array.from(d3.group(data, d => d.jurisdiction), ([key, values]) => ({ 
        jurisdiction: key, 
        values: values.sort((a, b) => a.year - b.year) // Sort by year
    }));

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

    // Axis labels
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Fines Amount");

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.top - 10})`)
        .style("text-anchor", "middle")
        .text("Year");

    // Chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Annual Fines by Jurisdiction");

    // Color scale - using a distinct color scheme for jurisdictions
    const color = d3.scaleOrdinal()
        .domain(jurisdictions.map(d => d.jurisdiction))
        .range(d3.schemeCategory10);

    // Line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    // Draw lines
    svg.selectAll(".line")
        .data(jurisdictions)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .style("stroke", d => color(d.jurisdiction))
        .style("fill", "none")
        .style("stroke-width", 2);

    // Draw dots
    jurisdictions.forEach(j => {
        svg.selectAll(`.dot-${j.jurisdiction.replace(/\s+/g, '')}`)
            .data(j.values)
            .enter()
            .append("circle")
            .attr("class", `dot dot-${j.jurisdiction.replace(/\s+/g, '')}`)
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.value))
            .attr("r", 3)
            .style("fill", color(j.jurisdiction))
            .style("opacity", 0.7);
    });

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "8px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "4px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    svg.selectAll("circle")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 5);

            tooltip.transition().duration(200).style("opacity", .9);
            tooltip.html(`Jurisdiction: ${d.jurisdiction}<br/>Year: ${d.year}<br/>Fines: $${d3.format(",")(d.value)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(this).attr("r", 3);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    // Legend
    const legend = svg.selectAll(".legend")
        .data(jurisdictions)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 20},${i * 25})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => color(d.jurisdiction));

    legend.append("text")
        .attr("x", 25)
        .attr("y", 14)
        .text(d => d.jurisdiction)
        .style("font-size", "12px");
}

// Call the function to create the chart
createLineChart();