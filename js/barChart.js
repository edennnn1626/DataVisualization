async function createBarChart(containerSelector = '#barChart') {
    const container = d3.select(containerSelector);
    if (container.empty()) return;
    container.selectAll('*').remove();

    const data = await loadData();
    // filter to 2023-2024
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2024-12-31');
    const filtered = data.filter(d => d.START_DATE >= startDate && d.START_DATE <= endDate);

    // Age groups of interest (normalize to CSV values)
    const ageOrder = ['0-16', '17-25', '26-39', '40-64', '65 and over'];

    const grouped = {};
    ageOrder.forEach(a => grouped[a] = 0);

    filtered.forEach(d => {
        const age = d.AGE_GROUP || 'Unknown';
        if (ageOrder.includes(age)) {
            grouped[age] += 1;
        } else {
            if (age.includes('65')) grouped['65 and over'] += 1;
            else if (age.includes('26') || age.includes('36') || age.includes('39')) grouped['26-39'] += 1;
            else if (age.includes('40') || age.includes('64')) grouped['40-64'] += 1;
        }
    });

    const chartData = ageOrder.map(age => ({ age, value: grouped[age] }));

    const margin = { top: 30, right: 20, bottom: 60, left: 100 };
    const width = Math.min(800, container.node().getBoundingClientRect().width || 800) - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(chartData.map(d => d.age))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.value) || 0])
        .nice()
        .range([height, 0]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'translate(0,0)')
        .style('text-anchor', 'middle');

    svg.append('g')
        .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(',')));

    // Bars
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    svg.selectAll('.bar')
        .data(chartData)
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
        .data(chartData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.age) + x.bandwidth() / 2)
        .attr('y', d => y(d.value) - 6)
        .attr('text-anchor', 'middle')
        .text(d => d.value ? d3.format(',')(d.value) : '');
}
