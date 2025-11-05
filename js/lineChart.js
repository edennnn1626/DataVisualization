async function createLineChart(containerSelector = null) {
    // Determine target container: prefer provided selector, then #lineChart, then #chart
    const target = containerSelector || (document.getElementById('lineChart') ? '#lineChart' : '#chart');
    // Load and process data
    const data = await loadData();
    const monthlyData = aggregateMonthlyData(data);

    // Set up chart dimensions
    const margin = { top: 40, right: 60, bottom: 60, left: 80 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear existing content in target
    d3.select(target).selectAll('*').remove();

    // Create SVG container
    const svg = d3.select(target)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleTime()
        .domain(d3.extent(monthlyData, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(monthlyData, d => d.value)])
        .nice()
        .range([height, 0]);

    // Add grid lines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .tickSize(-height)
            .tickFormat("")
        );

    svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
        );

    // Add X axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x)
            .ticks(d3.timeMonth.every(1))
            .tickFormat(d3.timeFormat("%b %Y")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)");

    // Add Y axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y)
            .tickFormat(d3.format(",")));

    // Add axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 5)
        .text("Month");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 20)
        .text("Number of Fines");

    // Create line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    // Add the line
    svg.append("path")
        .datum(monthlyData)
        .attr("class", "line")
        .attr("d", line);

    // Add dots
    const dots = svg.selectAll(".dot")
        .data(monthlyData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 5);

    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add tooltip interactions
    dots.on("mouseover", function(event, d) {
        d3.select(this)
            .attr("r", 7);

        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        
        tooltip.html(`
            Date: ${d3.timeFormat("%B %Y")(d.date)}<br/>
            Fines: ${d3.format(",")(d.value)}
        `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        d3.select(this)
            .attr("r", 5);

        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });
}