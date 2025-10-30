// === Detection Method Distribution Pie Chart ===
async function createMethodVSFinesChart(containerSelector = "#pieChart") {
  const container = d3.select(containerSelector);
  if (container.empty()) return;
  container.selectAll("*").remove(); // clear old chart

  const data = await loadData();

  // Filter for 2023–2024
  const startDate = new Date("2023-01-01");
  const endDate = new Date("2024-12-31");
  const filtered = data.filter(
    (d) => d.START_DATE >= startDate && d.START_DATE <= endDate
  );

  // === Aggregate by DETECTION_METHOD (sum fines) ===
  const grouped = d3.rollup(
    filtered,
    (v) => d3.sum(v, (d) => d.FINES),
    (d) => (d.DETECTION_METHOD || "Unknown").trim()
  );

  // === Convert and filter out "Unknown" & "Other" ===
  const pieData = Array.from(grouped, ([key, value]) => ({ key, value }))
    .filter(
      (d) =>
        d.key &&
        d.key.toLowerCase() !== "unknown" &&
        d.key.toLowerCase() !== "other"
    );

  if (pieData.length === 0) {
    container.append("p").text("No data available for 2023–2024");
    return;
  }

  // === Chart dimensions ===
  const width = 600;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 40;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2.8}, ${height / 2})`);

  // === Color scale ===
  const color = d3
    .scaleOrdinal()
    .domain(pieData.map((d) => d.key))
    .range(d3.schemeSet2);

  // === Pie + Arc setup ===
  const pie = d3.pie().value((d) => d.value);
  const arc = d3.arc().innerRadius(50).outerRadius(radius);

  // === Tooltip ===
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // === Draw slices ===
  svg
    .selectAll("path")
    .data(pie(pieData))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data.key))
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(100).attr("transform", "scale(1.05)");
      tooltip.transition().duration(150).style("opacity", 0.9);
      const percent = (
        (d.data.value / d3.sum(pieData, (p) => p.value)) *
        100
      ).toFixed(1);
      tooltip
        .html(
          `<strong>${d.data.key}</strong><br>${d3.format(",")(d.data.value)} fines<br>${percent}%`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(100).attr("transform", "scale(1)");
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // === Labels ===
  const labelArc = d3.arc().innerRadius(radius * 0.6).outerRadius(radius * 0.6);
  svg
    .selectAll("text")
    .data(pie(pieData))
    .enter()
    .append("text")
    .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", "11px")
    .attr("fill", "#333")
    .text((d) => d.data.key);

  // === Legend (on the right side) ===
  const legend = container
    .append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("position", "relative")
    .style("left", "65%")
    .style("top", "-350px");

  pieData.forEach((item) => {
    const row = legend
      .append("div")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "8px");

    row
      .append("div")
      .style("width", "14px")
      .style("height", "14px")
      .style("background", color(item.key))
      .style("margin-right", "8px")
      .style("border-radius", "2px");

    row
      .append("div")
      .style("font-size", "13px")
      .text(`${item.key} — ${d3.format(",")(item.value)}`);
  });
}
