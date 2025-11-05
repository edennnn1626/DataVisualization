// Load CSV data
d3.csv("SpeedFines.csv").then(data => {

  // Convert numeric fields
  data.forEach(d => {
    d.Fines = +d.Fines;
    d.Arrests = +d.Arrests;
    d.Charges = +d.Charges;
  });

  // Populate jurisdiction dropdown
  const jurisdictions = Array.from(new Set(data.map(d => d.JURISDICTION)));
  const select = d3.select("#jurisdictionSelect");
  select.selectAll("option")
    .data(jurisdictions)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  // Initial render for first jurisdiction
  updateCharts(jurisdictions[0]);

  // Update charts on selection
  select.on("change", (event) => {
    const selected = event.target.value;
    updateCharts(selected);
  });

  // Main function to draw charts
  function updateCharts(jurisdiction) {
    const filtered = data.filter(d => d.JURISDICTION === jurisdiction);

    drawBarChart(filtered);
    drawPieChart(filtered);
    drawScatterPlot(filtered);
  }

  // === BAR CHART === (Fines by Age Group)
  function drawBarChart(filtered) {
    d3.select("#barChart").selectAll("*").remove();
    const width = 400, height = 300, margin = 50;

    const svg = d3.select("#barChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scaleBand()
      .domain(filtered.map(d => d.AGE_GROUP))
      .range([margin, width - margin])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d.Fines)])
      .nice()
      .range([height - margin, margin]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin},0)`)
      .call(d3.axisLeft(y));

    svg.selectAll(".bar")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", d => x(d.AGE_GROUP))
      .attr("y", d => y(d.Fines))
      .attr("width", x.bandwidth())
      .attr("height", d => height - margin - y(d.Fines))
      .attr("fill", "#4e79a7");
  }

  // === PIE CHART === (Detection Method Distribution)
  function drawPieChart(filtered) {
    d3.select("#pieChart").selectAll("*").remove();
    const width = 300, height = 300, radius = Math.min(width, height) / 2;

    const svg = d3.select("#pieChart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d3.sum(filtered.filter(f => f.DETECTION_METHOD === d), f => f.Fines));
    const methods = Array.from(new Set(filtered.map(d => d.DETECTION_METHOD)));

    const color = d3.scaleOrdinal()
      .domain(methods)
      .range(d3.schemeTableau10);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svg.selectAll("path")
      .data(pie(methods))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data))
      .attr("stroke", "white")
      .style("stroke-width", "2px");
  }

  // === SCATTER PLOT === (Fines vs. Age Group)
  function drawScatterPlot(filtered) {
    d3.select("#scatterPlot").selectAll("*").remove();
    const width = 400, height = 300, margin = 50;

    const svg = d3.select("#scatterPlot")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const x = d3.scalePoint()
      .domain(filtered.map(d => d.AGE_GROUP))
      .range([margin, width - margin]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => d.Fines)])
      .nice()
      .range([height - margin, margin]);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .attr("transform", `translate(${margin},0)`)
      .call(d3.axisLeft(y));

    svg.selectAll("circle")
      .data(filtered)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.AGE_GROUP))
      .attr("cy", d => y(d.Fines))
      .attr("r", 6)
      .attr("fill", "#f28e2b")
      .attr("opacity", 0.8);
  }
});
