var sizes = new SizeManager();

var mainPadding = 15; // Fluid container padding
var navBarHeight = 71;

// Original width: 1200px, height: 800px
var heightFactor = sizes.height / 800;
var widthFactor = sizes.width / 1200; // Design is designed for 1200x800

var globalMargin = sizes.height / 10;

var categorySize = 50 * heightFactor;

var r1 = 200 * widthFactor;
var panAmount = 250 * widthFactor;

var bubbleRadius = 40 * widthFactor;

// var delta = ( 2 * Math.PI) / 14; //programs.length;
// var sizes.delta(6) = (2 * Math.PI) / 9;

var detailX = (sizes.width / 2)-120;
var detailY = sizes.height / 2; //350;
var selectedBubbleX = (sizes.width / 2)-100;
var selectedBubbleY = sizes.height / 2;

var pannedBubbleX = selectedBubbleX;
var tooltip = new Tooltip((d) => d[0]);
var donut, donutToggle;

//Icons for the program circles
var pimages = ["bio.png", "cof.png", "data.png", "el.png", "flyg2.png", "indek.png", "mech.png", "media.png"];
//Colours for the program circles
var color = (i) => d3.hcl(i * 27, 10 + 40 * Math.sin(i), 40 + (i % 2) * 40).toString();
var detailBubbleColor = ["#C1A34F", "#D86A6A", "#708B75"];
//All programs available in our data
var programs = [
  ["Computer Science", "Computer"],
  ["Media Technology", "Media"],
  ["Industrial Economy", "Economy"],
  ["Mechanical Engineering", "Mechanical"],
  ["Electrical Engineering", "Electrical"],
  ["Engineering Physics", "Physics"],
  ["Vehicle Engineering", "Vehicle"],
  ["Civil Engineering", "Civil"],
  ["Information Technology", "IT"],
  ["Design and Product Realization", "Prod. Design"],
  ["Chemistry", "Chemistry"],
  ["Architect", "Architect"],
  ["Biotechnology", "Biotech"],
  ["Constructional Engineering and Design", "Construct."]
];

//Creating Canvas
var canvas = d3.select('#main-svg')
  .attr('height', sizes.height)
  .attr('width', sizes.width);

var detailBubbles, detailText, bubble, bubbleText;
var clickedProgram = new Array(1);

//Reading in data from file using function rowToObject (data_processing) and running setup function
d3.csv("data/alumni_data.csv", rowToObject, setup);

//Creating dropdownlists
d3.json("data/skillsParent.json", dropdown);

function dropdown(error, json) {
  var options = '';
  var skillist = [];
  d3.json("data/alumni.json", function(data) {
    for (var i = 0; i < data.length; i++) {
      var company = data[i].Company;
      var profession = data[i].Profession;
      //console.log(val);
      if (skillist.indexOf(company) == -1) {
        options += '<option value="' + company + '"/>';
        skillist.push(company);
      }
      if (skillist.indexOf(profession) == -1) {
        options += '<option value="' + profession + '"/>';
        skillist.push(profession);
      }
    }
    document.getElementById('skill-list').innerHTML = options;
  });
    //console.log((matchAsData(data, ["Company", "Education"], ["Ericsson", "Computer Science"])));
  for (var i = 0; i < json.length; i++) {
    for (var j = 0; j < json[i].skills.length; j++) {
        //console.log(data);
      //console.log("j: ", j);
      //console.log(json[i].skills[j].name);
      var val = json[i].skills[j].name;
      if (skillist.indexOf(val) == -1) { //check if skill has already been added in order to avoid dublettes.
        options += '<option value="' + val + '"/>';
        skillist.push(val);
      }
    }
  }
  document.getElementById('skill-list').innerHTML = options;
}

function setup(error, data) {
  // Creating bubbles for: skills, companies, profession. Shown in second view (when clicking a program)
  detailBubbles = canvas.selectAll("div").data(["Companies", "Professions", "Skills"])
    .enter()
    .append("circle")
    .on("click", function(d, i) {
      toggleDonutButton(1);
      document.getElementById(i).style.stroke = 'white';
      document.getElementById(i).style['stroke-width']= '0.2em';
      if (i == 0) {
        document.getElementById("1").style.stroke = 'none';
        document.getElementById("2").style.stroke = 'none';
      } else if (i == 1) {
        document.getElementById("0").style.stroke = 'none';
        document.getElementById("2").style.stroke = 'none';
      }

      if (i == 2) {
        showSkillsDonut();
        document.getElementById("0").style.stroke = 'none';
        document.getElementById("1").style.stroke = 'none';
      } else {
        var array = filterOnClick(data, clickedProgram, i);
        bubblePan(d, i);
        if(donut) donut.delete();
        donut = new Donut(d, array, sizes.width/2, sizes.height/2, sizes.width*3/4, sizes.height/2);
      }
    })
    .classed("hidden-section", true)
    .classed("active-section", false)
    .style("opacity", 0)
    .attr("class", "detail-bubble")
    .attr("id", function(d,i){
      return i;
    })
    .attr("cx", selectedBubbleX)//(sizes.width / 2) - 100)
    .attr("cy", selectedBubbleY)//350)
    .attr("r", function(d) {
      return 5
    })
    //Move style to css file
    .attr("fill", function(d, i) {
      return detailBubbleColor[i]
    });

  //Creating text on bubbles: skills, companies, profession
  detailText = canvas.selectAll("div").data(["Companies", "Professions", "Skills"])
    .enter()
    .append("text")
    .classed("hidden-section", true)
    .classed("active-section", false)
    .style("opacity", 0)
    .attr("id", "detail-text")
    .on("click", function(d, i) {
      //If clicked on skills text
      document.getElementById(i).style.stroke = 'white';
      document.getElementById(i).style['stroke-width']= '0.2em';
      if (i == 0) {
        document.getElementById("1").style.stroke = 'none';
        document.getElementById("2").style.stroke = 'none';
      } else if (i == 1) {
        document.getElementById("0").style.stroke = 'none';
        document.getElementById("2").style.stroke = 'none';
      }

      if (i == 2) {
        showSkillsDonut();
        document.getElementById("0").style.stroke = 'none';
        document.getElementById("1").style.stroke = 'none';
      }
      //in companies or professions
      else{
        var array = filterOnClick(data, clickedProgram, i);
        bubblePan(d, i);
        if(donut) donut.delete();
        donut = new Donut(d, array, sizes.width/2, sizes.height/2, sizes.width*3/4, sizes.height/2);
      }
    })
    .on("mouseover", function(d,i){
      document.getElementById(i).setAttribute('fill', '#696969');
    })
    .on("mouseout", function(d,i){
      document.getElementById(i).setAttribute('fill', detailBubbleColor[i]);
    })
    .attr("class", "bubble-text")
    //Move style to css file
    .style("text-anchor", "middle")
    .style("fill", "#FFFFFF")
    //Apply text from data
    .text(function(d) {
      return (d).toUpperCase();
    });

  //Creating circles for all programms, shown in first view
  bubble = canvas.selectAll("div").data(programs)
    .enter()
    .append("circle")
    .on("click", bubbleTransform)
    //Move style to css file
    .style("fill", function(d, i) {
      return color(i)
    })
    .style("stroke-width", 3)
    .style("opacity", 0)
    .attr("class", "program-circle")
    .attr("id", function(d,i){
      return d[0];
    });

  //Creating text on circles for all programms, shown in first view
  bubbleText = canvas.selectAll("div").data(programs)
    .enter()
    .append("text")
    .attr("id", "bubble-text")
    .attr("class", "bubble-text")
    .on("click", bubbleTransform)
    .on("mouseover", function(d,i){
      tooltip.show(d);
      document.getElementById(programs[i][0]).style.opacity = 0.3;
    })
    .on("mouseout", function(d,i){
      tooltip.hide();
      document.getElementById(programs[i][0]).style.opacity = 1;
    })
    .on("mousemove", tooltip.move)
    //Move style to css file
    .style("text-anchor", "middle")
    .style("opacity", 0)
    //Apply text from data
    .text(function(d) {
      return (d[1]).toUpperCase();
    });

    welcometext = canvas.append("text")
      .attr("x", sizes.width / 2)
      .attr("y", sizes.height / 2)
      .attr("fill", "#fff")
      .attr("class", "welcome-text")
      .style("text-anchor", "middle")
      .style("opacity", 0)
      .text("SELECT A PROGRAM");

   donutDetails = canvas.selectAll("div").data(["More info"])
     .enter();

   donutDetails.append("rect")
     .attr("id", "donut-details")
     .classed("hidden-section", true)
     .classed("active-section", false)
     .attr("x", (sizes.width / 2) + 400*widthFactor)
     .attr("y", sizes.height*3 / 4)
     .attr("height", 150 * heightFactor)
     .attr("width", 300 * widthFactor)

     //Move style to css file
     .style("opacity", 0);

   donutDetails.append("text")
     .classed("hidden-section", true)
     .classed("active-section", false)
     .attr("id", "donut-details-text")
     .attr("x", (sizes.width / 2) + 120)
     .attr("y", sizes.height*3 / 4 + 30)
     //Move style to css file
     .style("opacity", 1)
     //Apply text from data
  //   .text("bralblblbllaaa Kul med jobb");

  var toggleButtonWidth = sizes.width / 15,
      toggleButtonHeight = sizes.height / 35;
  var containerX = sizes.width*3/4 - toggleButtonWidth,
      containerY = sizes.height / 6;

  var container = canvas.selectAll('div').data('a')
    .enter().append('g')
    .attr('id', 'donut-toggle')
    .classed("hidden-section", true)
    .classed("active-section", false)
    .attr('transform', 'translate(' + ( containerX) + ',' + (containerY) + ')')
    //.on("click", () => {(donut.showAll = !donut.showAll)})
    ;

  container.append('rect')
    .attr('class', 'toggleButton')
    .attr('id', 'toggleDonut1')
    .attr("width", toggleButtonWidth)
    .attr("height", toggleButtonHeight)
    .style('stroke-width', '0.2em')
    .on('click', function(){
      donut.showAll = false;
      toggleDonutButton(1);
    })
    ;

container.append('rect')
    .attr('class', 'toggleButton')
    .attr('id', 'toggleDonut2')
    .attr("x", toggleButtonWidth + 2)
    .attr("width", toggleButtonWidth)
    .attr("height", toggleButtonHeight)
  //  .style("opacity", 0.5)
    .on('click', function(){
      donut.showAll = true;
      toggleDonutButton(2);
    })
    ;

  container.append('text')
    .attr('class', 'bubble-text')
    .attr('id', 'toggleText1')
    .attr('x', toggleButtonWidth / 4)
    .attr('y', toggleButtonHeight / 2)
    .attr('dy', '.35em')
    .attr('fill', 'white')
    .text('TOP 10')
    .on('click', function(){
      donut.showAll = false;
      toggleDonutButton(1);
    })
    ;

  container.append('text')
    .attr('class', 'bubble-text')
    .attr('id', 'toggleText2')
    .attr('x', toggleButtonWidth * (2.7/2)  )
    .attr('y', toggleButtonHeight / 2 )
    .attr('dy', '.35em')
    .attr('fill', 'white')
    .text('ALL')
    .on('click', function(){
      donut.showAll = true;
      toggleDonutButton(2);
    })
    ;

    /*
  donutToggle = canvas.selectAll("div").data('')
    .enter()
    .append("rect")
    .attr("id", "donut-toggle")
    .classed("hidden-section", true)
    .classed("active-section", false)
    .attr("x", (sizes.width / 2) + 200)
    .attr("y", 50)
    .attr("height", 35)
    .attr("width", 100)
    .style("stroke", "#101010")
    .style("stroke-width", 1)
    .style("opacity", 1)
    .attr("fill", "#303030")
    .on("click", () => {(donut.showAll = !donut.showAll)})
    ;

  donutToggleText = canvas.selectAll("div").data("blabla")
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .classed("hidden-section", true)
    .classed("active-section", false)
    .attr("id", "donut-toggle-text")
    .attr("x", (sizes.width / 2) + 300)
    .attr("y", 70)
    .attr("fill", "#DDDDDD")
    //Move style to css file
    .style("opacity", 1)
    .on("click", () => {(donut.showAll = !donut.showAll)});
*/

  //Appending icons to all program circles
  /*icons = canvas.selectAll("div").data(pimages)
  	.enter()
  	.append("a")
  	.attr("id", "icons")
  	.on("click", function(d, i) {
      	bubbleTransform(d, i);
      	d3.selectAll("#icons")
      		.classed("hidden-section", true)
      		.classed("active-section", false);
    	})
  	.append("svg:image")
  	.attr("x", function(d,i) {return sizes.bigRadius * Math.cos(+i*delta) + 575})
  	.attr("y", function(d,i) {return sizes.bigRadius * Math.sin(+i*delta) + 325})
  	.attr("width", 50)
  	.attr("height", 50)
  	.style("opacity", 0)
  	.attr("xlink:href", function(d,i) { return "img/" + pimages[i]});*/

  mainViewAnimation();
}
function toggleDonutButton(buttonNr){
  if(buttonNr == 1){ //top10
    //document.getElementById('toggleDonut1').style.opacity =  0.7;
    //document.getElementById('toggleDonut2').style.opacity =  0.2;
    document.getElementById('toggleDonut1').style.stroke = 'white';
    document.getElementById('toggleDonut2').style.stroke = 'f8f8f8';
    document.getElementById('toggleDonut1').style['stroke-width']= '0.2em';
    document.getElementById('toggleDonut2').style['stroke-width'] = '0.05em';
  }else{ //show all
    //document.getElementById('toggleDonut2').style.opacity =  0.7;
    //document.getElementById('toggleDonut1').style.opacity =  0.2;
    document.getElementById('toggleDonut2').style.stroke = 'white';
    document.getElementById('toggleDonut1').style.stroke = 'f8f8f8';
    document.getElementById('toggleDonut2').style['stroke-width'] = '0.2em';
    document.getElementById('toggleDonut1').style['stroke-width']= '0.05em';
  }
}
//End of setup function

function mainViewAnimation(){
  if(donut){donut.delete();};

  bubble.transition()
    .delay(function(d, i) {
      return i * 100
    })
    .duration(1300)
    .style("opacity", 1)
    .attr('r', sizes.bubbleRadius)
    .attr("cx", function(d, i) {
      return sizes.bigRadius * Math.cos(+i * sizes.delta(14)) + sizes.width / 2;
    })
    .attr("cy", function(d, i) {
      return sizes.bigRadius * Math.sin(+i * sizes.delta(14)) + sizes.height / 2;
    });

  bubbleText.transition()
    .delay(function(d, i) {
      return i * 100
    })
    .duration(1300)
    .attr("x", function(d, i) {
      return sizes.bigRadius * Math.cos(+i * sizes.delta(14)) + sizes.width / 2;
    })
    .attr("y", function(d, i) {
      return sizes.bigRadius * Math.sin(+i * sizes.delta(14)) + sizes.height / 2 + 7;
    })
    .style("opacity", 0.9)
    .text(function(d) {
      return (d[1]).toUpperCase();
    });

  bubble
    .on("mouseover", tooltip.show)
    .on("mousemove", tooltip.move)
    .on("mouseout", tooltip.hide)
    .on("click", bubbleTransform);
  bubbleText
    .on("mouseover", tooltip.show)
    .on("mousemove", tooltip.move)
    .on("mouseout", tooltip.hide)
    .on("click", bubbleTransform)
    .on('mouseover', function(d,i){
      tooltip.show(d);
      document.getElementById(programs[i][1]).style.opacity = 0.3;
    })
    .on('mouseout', function(d,i){
      tooltip.hide();
      document.getElementById(programs[i][1]).style.opacity = 1;
    });
  //reset selected detailBubble
  document.getElementById("0").style.stroke = 'none';
  document.getElementById("1").style.stroke = 'none';
  document.getElementById("2").style.stroke = 'none';
  //detailBubbles.style("opacity", 0);
  //detailText.style("opacity", 0);

  welcometext.transition()
    .delay(1600)
    .duration(1100)
    .style("opacity", 1);
}

function checkEnterPress(event) {
  console.log("enter");
  if (event.keyCode == 13) {
    skillSearch();
  } else {
    return false;
  }
}
//For search button tests
function skillSearch(value) {

  var skill = document.getElementById("skill-value").value;
  var valueList = [];
  var rad = [];
  var value;
  var educationCheck = [];
  var educations = {};
  var count = 1;

  var companyVal;

  d3.json("data/alumni.json", function(json) {

    for (i = 0; i < json.length; i++) {
      if (json[i].Company == skill || json[i].Profession == skill) {
        if (json[i].Company == skill) {
          value = "Company";
          companyVal = json[i].Education;
          if (educationCheck.indexOf(companyVal) == -1) {
            educationCheck.push(companyVal);
            educations[companyVal] = 1;
          } else {
            educations[companyVal] = educations[companyVal] + 1;
          }


        } else if (json[i].Profession == skill) {
          value = "Profession";
          professionVal = json[i].Education;
          if (educationCheck.indexOf(professionVal) == -1) {
            educationCheck.push(professionVal);
            educations[professionVal] = 1;
          } else {
            educations[professionVal] = educations[professionVal] + 1;
          }
        }
      }
    }

    console.log(educations["Electrical Engineering"]);

    if (value) {
        bubble.transition()
        .delay(100)
        .duration(2000)
        .attr("r", function(d, i) {
            console.log(programs[i][0]);
            var program = programs[i][0];
            //if (json[i][value].toLowerCase() == skill.toLowerCase()) {
            if (skill) {
              for (j = 0; j < educationCheck.length; j++) {
                if (program == educationCheck[j]) {
                  var max = Math.max.apply(null, Object.keys(educations).map(function(e) { return educations[e]; }));
                  rad[i] = (educations[program] / max) * 80;
                  console.log(rad[i]);
                  return rad[i];
                }
              }
            } else {
              return 50;
            }

            if (!rad[i]) {
              return 0;
            }
          });

            //If search query empty, reset size

        bubbleText.transition()
        .delay(100)
        .duration(2000)
        .style("opacity", function(d, i) {
          var program = programs[i][0];
            //fÃ¥ tillbaks namnen om man trycker pÃ¥ inget
            if (skill == "") {
              return 1;
            }
            else if (rad[i] > 0) {

              return 1;
            } else {
              return 0;
            }
        });

      }

    });






  //hide welcome text when searching
  if (skill == "") {
        welcometext.transition()
            .delay(100)
            .duration(1100)
            .style("opacity", 1);
  } else {

    welcometext.transition()
            .delay(100)
            .duration(1100)
            .style("opacity", 0);
  }

  d3.json("data/skillsParent.json", function(json) {

    //Checking values of chosen skill and push into Valuelist.
    for (i = 0; i < json.length; i++) {
      for (j = 0; j < json[i].skills.length; j++) {
        if (json[i].skills[j].name !== undefined) {
          if (json[i].skills[j].name.toLowerCase() == skill.toLowerCase()) {
            valueList.push(+(json[i].skills[j].value));
          };
        };
      };
    };

    //Bubble transition depending on values of skills
    bubble.transition()
      .delay(100)
      .duration(2000)
      .attr('r', function(d, i) {

          for (j = 0; j < json[i].skills.length; j++) {
            if (json[i].skills[j].name !== undefined) {
              if (json[i].skills[j].name.toLowerCase() == skill.toLowerCase()) {
                rad[i] = (parseInt(json[i].skills[j].value) / d3.max(valueList) * 80);
                return rad[i];
              }
              //If search query empty, reset size
              else if (skill == "") {
                return bubbleRadius;
              }
            };
          };
          //If program doesn't have skill, set r to 0
          if (!rad[i]) {
            return 0;
          }
        });

    bubbleText.transition()
      .delay(100)
      .duration(2000)
      .style("opacity", function(d, i) {

        for (j = 0; j < json[i].skills.length; j++) {
          //console.log(json[i].skills[j].name);
          //fÃ¥ tillbaks namnen om man trycker pÃ¥ inget
          if (skill == "") {
            return 1;
          }
          else if (rad[i] > 0) {

            return 1;
          } else if (json[i].skills[j].name !== skill) {

            return 0;
          }
        }
      });
  });
}

function bubbleTransform(d, i) {
  tooltip.hide();
  clickedProgram[0] = d[0];
  var chosenIndex = i;
  pannedBubbleX = selectedBubbleX;

  d3.selectAll(".detail-bubble, #detail-text")
    .classed("active-section", true)
    .classed("hidden-section", false);

  d3.selectAll("#input-group-wrapper")
    .classed("active-section", false)
    .classed("hidden-section", true);

  detailBubbles.transition()
    .delay(600)
    .duration(1100)
    .attr("cx", (d,i) => detailX + sizes.bigRadius* Math.cos((+i - 1) * sizes.delta(6)))
    .attr("cy", (d, i) => detailY + sizes.bigRadius* Math.sin((+i - 1) * sizes.delta(6)))
    .attr("r", 50 * widthFactor)
    .style("opacity", 1);

  detailText.transition()
    .delay(800)
    .duration(1100)
    .attr("x", (d,i) => detailX + sizes.bigRadius* Math.cos((+i - 1) * sizes.delta(6)))
    .attr("y", (d, i) => detailY + sizes.bigRadius* Math.sin((+i - 1) * sizes.delta(6)))
    .style("opacity", 1);

  bubble.transition()
    .delay(100)
    .duration(1100)
    .style("opacity", function(d, i) {
      if (i != chosenIndex) {
        return 0;
      }
    })
    .attr("r", function(d, i) {
      if (i == chosenIndex) {
        return 90 * widthFactor;
      }
    })
    .attr("cx", selectedBubbleX)
    .attr("cy", selectedBubbleY)
    .attr("fill", function(d, i) {
      return color(i);
    });

    //Hide tooltip in the detailView; & change onClick event
  bubble.on("mouseover", tooltip.hide)
    .on("mousemove", tooltip.hide)
    .on("mouseout", tooltip.hide)
    .on("click", function() {
      mainViewAnimation();
      backTransition();
    });

  bubbleText.on("mouseover", tooltip.hide)
    .on("mousemove", tooltip.hide)
    .on("mouseout", tooltip.hide)
    .on("click", function() {
      mainViewAnimation();
      backTransition();
    });

  bubbleText.transition()
    .delay(100)
    .duration(1100)
    .style("opacity", function(d, i) {
      if (i != chosenIndex) {
        return 0;
      }
    })
    .attr("x", selectedBubbleX)
    .attr("y", selectedBubbleY)
    .transition()
    .text(function(d) {
      return (d[0]).toUpperCase();
    });

    welcometext.transition()
      .delay(100)
      .duration(100)
      .style("opacity", 0);
}
//end of bubbleTransform

function bubblePan(d, i) {
  var chosenIndex = i;
  pannedBubbleX = selectedBubbleX - sizes.shortSide/2;

  detailBubbles.transition()
    .delay(200)
    .duration(800)
    .attr("cx", (d, i) => sizes.width/3 + sizes.focusRadius * Math.cos((i - 1)));

  detailText.transition()
    .delay(200)
    .duration(800)
    .attr("x", (d, i) => sizes.width/3 +  sizes.focusRadius * Math.cos((i - 1)));

  bubble.transition()
    .delay(100)
    .duration(800)
    .attr("cx", sizes.width/5)
    .attr("cy", sizes.height/2)
    .attr("fill", function(d, i) {
      return color(i);
    });


  bubbleText.transition()
    .delay(100)
    .duration(800)
    .attr("x", sizes.width/5)
    .attr("y", sizes.height/2)

  /*bubbleText.transition()
    .delay(100)
    .duration(1100)
    .style("opacity", function(d, i) {
      if (i != chosenIndex) {
        return 0;
      }
    })
    .attr("x", selectedBubbleX - 250)
    .attr("y", selectedBubbleY);
    */
}
/*
//For second view: show details about skills, compnies, professions
function showDetails(newDiv, typeOfData) {

  //Hide if details is active
  d3.selectAll("#details-description")
    .classed("active-sub-section", false)
    .classed("hidden-sub-section", true);

  //Show new div
  d3.selectAll("#" + newDiv)
    .classed("hidden-sub-section", false)
    .classed("active-sub-section", true)
    .html("I want to see: " + typeOfData);
}
*/
function backTransition() {
  //donut.delete();

  // d3.selectAll("#bubble-text")
  //   .classed("hidden-section", false)
  //   .classed("active-section", true);

  d3.selectAll("#input-group-wrapper")
    .classed("active-section", true)
    .classed("hidden-section", false);

  detailText.transition()
    .delay(100)
    .duration(400)
    .style("opacity", 0)
    .transition()
    .attr("x", function(d, i) {
      return sizes.bigRadius * Math.cos((+i - 1) * sizes.delta(6)) + 100 + detailX * widthFactor * 3 / 4;//sizes.bigRadius * Math.cos((+i - 1) * sizes.delta(6)) + detailX;
    });

  detailBubbles.transition()
    .delay(100)
    .duration(1000)
    .attr("cx", pannedBubbleX)//sizes.width / 2) - 200)
    .attr("cy", selectedBubbleY)//sizes.height / 2)
    .attr("r", 5)
    .style("opacity", 0)
    .transition()
    .attr("cx", selectedBubbleX);

  // bubble.transition()
  //   .delay(400)
  //   .duration(1100)
  //   .attr("cx", function(d, i) {
  //     return sizes.bigRadius * Math.cos(+i * delta) + sizes.width / 2;
  //   })
  //   .attr("cy", function(d, i) {
  //     return sizes.bigRadius * Math.sin(+i * delta) + sizes.height / 2;
  //   })
  //   .attr("r", function(d) {
  //     return 50;
  //   })
  //   .style("stroke", function(d, i) {
  //     return color(i);
  //   })
  //   .style("stroke-width", 3)
  //   .style("opacity", 1)
  //   .attr("fill", "#ffffff");

  // bubbleText.transition()
  //   .delay(400)
  //   .duration(1100)
  //   .attr("x", function(d, i) {
  //     return sizes.bigRadius * Math.cos(+i * delta) + sizes.width / 2;
  //   })
  //   .attr("y", function(d, i) {
  //     return sizes.bigRadius * Math.sin(+i * delta) + sizes.height / 2;
  //   })
  //   .style("opacity", 1);
}
//end of backTransition

function showSkillsDonut(){
  d3.json("data/skillsParent.json", function(d) {
    var array = {};
    for (var i = 0; i < d.length; i++) {
      if (d[i].program == clickedProgram[0]) {
        for (var j = 0; j < d[i].skills.length; j++) {
          array[d[i].skills[j].name] = parseInt(d[i].skills[j].value);
        }
      }
    }
    bubblePan(d, i);
    if(donut) donut.delete(); //
    donut = new Donut(d, array, sizes.width/2, sizes.height/2, sizes.width*3/4, sizes.height/2);
  });
}
