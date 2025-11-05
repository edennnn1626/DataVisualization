// Horizontal Bar Chart: Detection Method Usage Count (2023–2024)
async function createMethodCountChart(containerSelector = '#methodCountChart') {
  const container = d3.select(containerSelector);
  if (container.empty()) return;
  container.selectAll('*').remove();

  const data = await loadData();
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');
  const filtered = data.filter(d => d.START_DATE >= startDate && d.START_DATE <= endDate);

  // ✅ Count occurrences of each DETECTION_METHOD
  const grouped = {};
  filtered.forEach(d => {
    const key = (d.DETECTION_METHOD || '').trim();
    if (!key || key.toLowerCase() === 'unknown' || key.toLowerCase() === 'other') return; // skip unwanted
    if (!grouped[key]) grouped[key] = 0;
    grouped[key] += 1; // ✅ increment count (not fines)
  });

  let chartData = Object.entries(grouped).map(([key, value]) => ({ method: key, count: value }));

  // ✅ Sort descending by count
  chartData.sort((a, b) => b.count - a.count);

  if (chartData.length === 0) {
    container.append('div').text('No data available for 2023–2024');
    return;
  }

  const margin = { top: 40, right: 40, bottom: 40, left: 180 };
  const width = Math.min(700, container.node().getBoundingClientRect().width || 700);
  const height = chartData.length * 30 + margin.top + margin.bottom;

  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height);

  const x = d3.scaleLinear()
    .domain([0, d3.max(chartData, d => d.count)])
    .nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(chartData.map(d => d.method))
    .range([margin.top, height - margin.bottom])
    .padding(0.15);

  const color = d3.scaleOrdinal(d3.schemeTableau10)
    .domain(chartData.map(d => d.method));

  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // ✅ Bars
  svg.selectAll('.bar')
    .data(chartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('y', d => y(d.method))
    .attr('x', x(0))
    .attr('height', y.bandwidth())
    .attr('width', d => x(d.count) - x(0))
    .attr('fill', d => color(d.method))
    .on('mouseover', function (event, d) {
      d3.select(this).transition().duration(100).attr('opacity', 0.8);
      tooltip.transition().duration(150).style('opacity', 0.9);
      tooltip.html(`<strong>${d.method}</strong><br/>Count: ${d3.format(',')(d.count)}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function () {
      d3.select(this).transition().duration(100).attr('opacity', 1);
      tooltip.transition().duration(200).style('opacity', 0);
    });

  // X Axis
  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6, "~s"));

  // Y Axis
  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Title
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', margin.top / 2)
    .attr('text-anchor', 'middle')
    .attr('font-weight', 'bold')
    .attr('font-size', 16)
    .text('Detection Method Usage Count (2023–2024)');
}
