async function createBarChart(containerSelector = '#barChart') {
    const container = d3.select(containerSelector);
    if (container.empty()) return;
    container.selectAll('*').remove();

    // Load CSV data
    const csvData = await d3.csv('AgeGroupFinesContributes.csv', d => ({
        age: d['AGE_GROUP'],       // must match CSV header exactly
        value: +d['Sum(FINES)']    // convert string to number
    }));

    const margin = { top: 30, right: 20, bottom: 60, left: 100 };
    const width = Math.min(800, container.node().getBoundingClientRect().width || 800) - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(csvData.map(d => d.age))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(csvData, d => d.value)])
        .nice()
        .range([height, 0]);

    // X and Y axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'translate(0,0)')
        .style('text-anchor', 'middle');

    svg.append('g')
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(',')));

    // Tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Bars
    svg.selectAll('.bar')
        .data(csvData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.age))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.value))
        .attr('fill', '#1f77b4')
        .on('mouseover', function (event, d) {
            d3.select(this).attr('fill', '#ff7f0e');
            tooltip.transition().duration(150).style('opacity', .9);
            tooltip.html(`${d.age}<br/>Fines: ${d3.format(',')(d.value)}`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function () {
            d3.select(this).attr('fill', '#1f77b4');
            tooltip.transition().duration(200).style('opacity', 0);
        });

    // Value labels
    svg.selectAll('.label')
        .data(csvData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.age) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) - 6)
        .attr('text-anchor', 'middle')
        .text(d => d3.format(',')(d.value));
}
