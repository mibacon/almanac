console.log("hello world")

$(function () { 


	var totalHeight = window.innerHeight
	
	
	var totalWidth = window.innerWidth
	var width, numPerRow, size = 10;
	
	d3.json("data.json", function(data){
		
				
		var div = d3.select("body").append("div")
			    .attr("class", "tooltip")
			    .style("opacity", 0);
	
		var margin = {top:0, right:50, bottom:40, left:15}
	    	//width = 500 - margin.left - margin.right,
			// height = totalHeight - margin.top - margin.bottom;
		var legend = $('.legend').html("<strong>Transaction occured on: </strong>" + '<br>')
			legend.append('<img src="blue.png" style="height:10px"> ').append("  Positive Day <br>")
			legend.append('<img src="orange.png" style="height:10px"> ').append("  Negative Day <br>")
			legend.append("*significant")
		d3.select('.right_side .label').html("Individual's Ethnicity:" + "<br> <br>")
		  	
		  	
		function update(field) {
			var month_order = ["Nisannu", "Ayyaru", "Simanu", "Du'uzu", "Abu", "Elulu", "Tasritu", "Arahsamnu", "Kislimu", "Tebetu", "Sabatu", "Addaru"];
			var king_order = ["Nebuchadnezzar II", "Amel-Marduk","Nabonidus", "Cyrus", "Cambyses",  "Bardiya", "Nebuchadnezzar IV", "DariusI", "Xerxes", "Artaxerxes I", "Darius II", "Unlisted"]


			var nest = d3.nest()
				.key(function(d) { return d.new_eth})
				.sortKeys(d3.ascending)
				.key(function(d) { return d[field]})
				// .sortKeys(d3.ascending)
				.sortKeys(function(a,b) { 
					if(field == "Month") {
						return month_order.indexOf(a) - month_order.indexOf(b); 
					} else if (field == "Reign") {
						return king_order.indexOf(a) - king_order.indexOf(b); 
					}  else {
						return d3.ascending(a,b)
					}
				})
			   	.entries(data);
			   	
			// 
			nest.stats = {}

			nest.forEach(function(v,k) {
				v.stats = {}

				v.values.forEach(function(val,ke) {
					val.stats = {}
					val.stats["total"] = val.values.length
					
					var pcount = 0
					var ncount = 0
				
					

					v.stats[val.key] = val.values.length

					
					val.values.forEach(function(value, keys) {
						if (value.Babylonian_Almanac == "+") {
							pcount ++
						} else {
							ncount ++
						}
					})
					
					var pper = Math.floor((pcount/val.values.length)*100)
					var nper = Math.floor((ncount/val.values.length)*100)
					
					
					val.stats["perPos"] = pper + "%"
					val.stats["perNeg"] = nper + "%"
					
					
					if(nest.stats[val.key]) {
						if(nest.stats[val.key] < v.stats[val.key]) {
							nest.stats[val.key] = v.stats[val.key]
						}
					} else {
						nest.stats[val.key] = v.stats[val.key]
					}
					
				})

				
			})


			nest.stats.significance = {
				"ALL": [],
				"Archive": ["Yahudu"],
				"Reign": ["Bardiya", "Darius I", "Darius II"],
				"Month": ["Simanu","Elulu", "Tasritu", "Arahsamnu", "Kislimu", "Tebetu"],
				"father_eth": ["Non-Babylonian"]
			}

			console.log(nest)
			var filterNest = nest.filter(function(d) {return ((d.key == "b")||(d.key == "n"))})



		    var svg = d3.select(".right").selectAll(".dayType")
		    	.data(filterNest)
		    	.enter()
		    	.append("div")
		    	.attr("class", "dayType")
		    	.attr("id", function(d) {
		    		if(d.key == "b") {
		    			return "Babylonian"
		    		} else if (d.key == "-") {
		    			return "Non-Babylonian"
		    		}
		    	})
		    	
			
			
			width = $('.dayType').width()
			numPerRow = Math.floor(width/(size+1))
			console.log('width is'  + width + ' and numperrow is '+ numPerRow)
	

			var scale = d3.scaleLinear()
				.domain([0, numPerRow -1])
			  	.range([0, size * numPerRow])
		  	
		  	
		    svg.append("div").attr("class","title_bar").append("text")
		    	.text(function(d) {
		    		if(d.key == "b") {
		    			return "BABYLONIANS"
		    		} else if (d.key == "n") {
		    			return "NON-BABYLONIANS"
		    		}})
		    	.attr("transform", "translate(" + margin.left + "," + 20 + ")")
		    	
		    	
			    
			var subSvg = svg.selectAll(".selectedGroups")
				.data(function(d) {return d.values})
				.enter()
				.append("svg")
				.attr("class", "selectedGroups")
				
				.attr("height", function(d) {
					return (nest.stats[d.key]/numPerRow*size) + 65
					
				})
					

			// // 	// console.log(nest)
			
			subSvg.append("text")
				.text(function(d) { return d.key})
				.attr("transform", "translate(" + margin.left + "," + 25 + ")")
				.attr("font-size", "14px")
				
			
			subSvg.append("text")
				.text(function(d) { 
					if(nest.stats.significance[field].indexOf(d.key) >=0 ) { 
							return "Positive:" + d.stats.perPos + "	 Negative:" + d.stats.perNeg  + " *"
	
					} else {
						return "Positive:" + d.stats.perPos + "	 Negative:" + d.stats.perNeg
					}

					
				})
				.attr("transform", "translate(" + (width-30) + "," + 25 + ")")
				.attr("text-anchor", "end")
				.attr("font-size", "10px")
				

						
			
			var waffle = subSvg.append("g")
		        .attr("class", "waffle")
		        .attr("transform", "translate(" + margin.left + "," + 30 + ")");
	

			var cells = waffle.selectAll("rect")
				.data(function(d) {return d.values})
				.enter().append('rect')
				.sort(function(x, y){
					if(x.key == "+/-") {console.log(x.new_eth)}
				   return d3.ascending(x.Babylonian_Almanac, y.Babylonian_Almanac);
				})
				.attr('x', (d, i) => {
			    	var n = i % numPerRow
			    	return scale(n)
			  	})
			  	.attr('y', (d, i) => {
			    	var n = Math.floor(i / numPerRow)
			    	return scale(n)
				  	}) 
			  	.attr('width', size)
			  	.attr('height', size)
			  	.attr('fill', function(d) {
			  		if(d.Babylonian_Almanac == "+") {
			  			return "#299AE8"
			  		} else {
			  			return "#20DFFF"
			  		} 
			  	})
		  		.attr('stroke-width', 2)
		  		.attr('stroke', 'white')
		  		.attr('class', function(d){ return d.Text_Publication_Number})
		  			
		  		.style("opacity", 1)
				.on("mouseover", function(d) {
				// 	d3.selectAll("." + this.getAttribute('class')).style("opacity", .5)
				// })

			      div.transition()
			         .duration(200)
			         .style("opacity", .9);
			      div.html("Document: " + d.Text_Publication_Number + "<br/> Date: " + d.Date_MMDD)
			         .style("left", (d3.event.pageX) + "px")
			         .style("top", (d3.event.pageY - 28) + "px");
			      })
			     .on("mouseout", function(d) {
			     	// d3.selectAll("."+ this.getAttribute('class')).style("opacity", 1) })
			      div.transition()
			         .duration(500)
			         .style("opacity", 0);
			      })


		}

		$('button').on("click", function(){
			if(!$(this).hasClass("clicked")) {
				$('.clicked').removeClass()
				$(this).addClass("clicked")

				var selection = $(this).attr("id")
				

				update(selection)

			}
		})

		



	}) //end of data

}) //end of jquery

