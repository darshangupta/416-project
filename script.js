
d3.csv("car_prices.csv").then(data => {
  
    data.forEach(d => {
      d.car_ID = +d.car_ID;
      d.symboling = +d.symboling;
      d.wheelbase = +d.wheelbase;
      d.carlength = +d.carlength;
      d.carwidth = +d.carwidth;
      d.carheight = +d.carheight;
      d.curbweight = +d.curbweight;
      d.enginesize = +d.enginesize;
      d.boreratio = +d.boreratio;
      d.stroke = +d.stroke;
      d.compressionratio = +d.compressionratio;
      d.horsepower = +d.horsepower;
      d.peakrpm = +d.peakrpm;
      d.citympg = +d.citympg;
      d.highwaympg = +d.highwaympg;
      d.price = +d.price;
    });
  
    
    let currentScene = 0;
  
    
    const scatterWidth = 500;
    
    function buildScatterPlot() {
        const dimensions = { width: 500, height: 400, margin: { top: 20, right: 30, bottom: 40, left: 50 } };
        const scatterSvg = createSvg("#scatterPlot", dimensions);
        const scatterGroup = createGroup(scatterSvg, dimensions);
    
        const scatterX = d3.scaleBand().domain(data.map(d => d.drivewheel)).range([0, dimensions.width]).padding(0.1);
        const scatterY = d3.scaleLinear().domain([0, d3.max(data, d => d.horsepower)]).nice().range([dimensions.height, 0]);
        const tooltip = createTooltip("#scatterPlot");
    
        scatterGroup.selectAll("circle").data(data).enter().append("circle")
            .attr("cx", d => scatterX(d.drivewheel) + scatterX.bandwidth() / 2)
            .attr("cy", d => scatterY(d.horsepower))
            .attr("r", 5)
            .attr("fill", "blue")
            .attr("opacity", 0.7)
            .on("mouseover", (event, d) => showTooltip(event, tooltip, `${d.CarName}<br>Horsepower: ${d.horsepower} hp`))
            .on("mouseout", () => hideTooltip(tooltip));
    
        appendAxes(scatterGroup, scatterX, scatterY, dimensions, "Drive Wheel", "Horsepower");
    }
    
    
    function buildBarChart() {
        const dimensions = { width: 500, height: 300, margin: { top: 20, right: 100, bottom: 40, left: 100 } };
        const barSvg = createSvg("#barChart", dimensions);
        const barGroup = createGroup(barSvg, dimensions);
    
        const barChartData = d3.rollup(data, v => d3.mean(v, d => d.price), d => d.enginelocation);
        const barX = d3.scaleBand().domain([...barChartData.keys()]).range([0, dimensions.width]).padding(0.1);
        const barY = d3.scaleLinear().domain([0, d3.max(barChartData.values())]).nice().range([dimensions.height, 0]);
        const tooltip = createTooltip("#barChart");
    
        barGroup.selectAll("rect").data([...barChartData]).enter().append("rect")
            .attr("x", d => barX(d[0]))
            .attr("y", d => barY(d[1]))
            .attr("width", barX.bandwidth())
            .attr("height", d => dimensions.height - barY(d[1]))
            .attr("fill", "steelblue")
            .on("mouseover", (event, d) => showTooltip(event, tooltip, `${d[0]}<br>Average Price: $${d[1].toFixed(2)}`))
            .on("mouseout", () => hideTooltip(tooltip));
    
        appendAxes(barGroup, barX, barY, dimensions, "Engine Location", "Average Price");
    }
    
      
  
    function buildBubbleChart() {
        const dimensions = { width: 600, height: 400, margin: { top: 20, right: 30, bottom: 40, left: 50 } };
        const bubbleSvg = createSvg("#bubbleChart", dimensions);
        const bubbleGroup = createGroup(bubbleSvg, dimensions);
    
        const bubbleX = d3.scaleLinear().domain([0, d3.max(data, d => d.horsepower)]).nice().range([0, dimensions.width]);
        const bubbleY = d3.scaleLinear().domain([0, d3.max(data, d => d.price)]).nice().range([dimensions.height, 0]);
        const bubbleSize = d3.scaleSqrt().domain([d3.min(data, d => d.curbweight), d3.max(data, d => d.curbweight)]).range([5, 30]);
        const bubbleColor = d3.scaleOrdinal().domain(["front", "rear"]).range(["#1f77b4", "#ff7f0e"]);
        const tooltip = createTooltip("#bubbleChart");
    
        bubbleGroup.selectAll("circle").data(data).enter().append("circle")
            .attr("cx", d => bubbleX(d.horsepower))
            .attr("cy", d => bubbleY(d.price))
            .attr("r", d => bubbleSize(d.curbweight))
            .attr("fill", d => bubbleColor(d.enginelocation))
            .attr("opacity", 0.7)
            .on("mouseover", (event, d) => showTooltip(event, tooltip, `${d.CarName}<br>Price: $${d.price}<br>Horsepower: ${d.horsepower} hp<br>Curbweight: ${d.curbweight} lbs`))
            .on("mouseout", () => hideTooltip(tooltip));
    
        appendAxes(bubbleGroup, bubbleX, bubbleY, dimensions, "Horsepower", "Price");
    }
    
    function createSvg(selector, { width, height, margin }) {
        return d3.select(selector).html("").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
    }
    
    function createGroup(svg, { margin }) {
        return svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    }
    
    function createTooltip(selector) {
        return d3.select(selector)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }
    
    function showTooltip(event, tooltip, content) {
        tooltip.style("opacity", 1)
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px")
            .html(`<b>${content}</b>`);
    }
    
    function hideTooltip(tooltip) {
        tooltip.style("opacity", 0);
    }
    
    function appendAxes(group, xScale, yScale, { width, height, margin }, xLabel, yLabel) {
        group.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xScale));
        group.append("g").call(d3.axisLeft(yScale));
    
        group.append("text")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .attr("text-anchor", "middle")
            .attr("class", "chart-axis-text")
            .text(xLabel);
    
        group.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 10)
            .attr("text-anchor", "middle")
            .attr("class", "chart-axis-text")
            .text(yLabel);
    }
    
  
    function nextScene() {
      if (currentScene === 0) {
        buildScatterPlot();
      } else if (currentScene === 1) {
        buildBarChart();
      } else if (currentScene === 2) {
        buildBubbleChart();
      }
    }
  
    d3.select("#next").on("click", () => {
      currentScene = (currentScene + 1) % 3; 
      nextScene();
    });
  
    nextScene();
  });