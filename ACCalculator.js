"use strict";
// import Env from "jest-jasmine2/build/jasmine/Env";
//
// export {Environment, System, CoolGreenExcel}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let startingHTML;
startingHTML = '<div class="container">\n' +
    '    <div class="row">\n' +
    '        <div class="col-sm-5" id="map">\n' +
    '            <div id="chartdiv" style="height: 50vh; width: 80vw"></div>\n' +
    '<h4 id="location"></h4>' +
    '        </div>\n' +
    '        <div class="col-sm-5 card m-3" id="sliders">\n' +
    '        </div>\n' +
    '    </div>\n' +
    ' <p></p>' +
    '        <div class="row" id="systems">\n' +
    '            <div class="col-sm-3 m-4" id="addSection">\n' +
    '                <button id="add">add system</button>\n' +
    '            </div>\n' +
    '    </div>\n' +
    '<p></p>' +
    '<div class="row">\n' +
    ' <div class="col-sm-2">   ' +
    '<button id="calculate">Calculate</button>\n' +
    '</div>' +
    '<div class="col-sm-8" id="results">' +
    '</div>' +
    '    </div>' +
    '</div>';
$("#coolgreenpowercalculator").append(startingHTML);
// represents the environmental variables that hold across the systems
// given by the user through the form
class Customer {
    constructor(coolingDegreeDays, daysOfOperation, kWhPrice) {
        this.listOfSystems = [];
        this._averageSavings = .3;
        this._degreeHourDay = 24;
        this._designTemperature = 96;
        this._annualRateIncrease = 1.03;
        this._co2PerKWh = 0.0004554;
        this._coolingDegreeDays = coolingDegreeDays;
        this._daysOfOperation = daysOfOperation;
        this._kWhPrice = kWhPrice;
        this._equivalentFullLoad = (coolingDegreeDays * this._degreeHourDay) / (this._designTemperature - 65);
        let cumulative = 0;
        for (let i = 0; i < 10; i += 1) {
            cumulative += Math.pow(1.03, i);
        }
        this._tenYearCumulative = cumulative;
    }
    set coolingDegreeDays(value) {
        this._coolingDegreeDays = value;
        this._equivalentFullLoad = (value * this._degreeHourDay) / (this._designTemperature - 65);
    }
    set daysOfOperation(value) {
        this._daysOfOperation = value;
    }
    set kWhPrice(value) {
        this._kWhPrice = value;
    }
    generateSystem(num) {
        $('#addSection').before('<div id="system' + num + '" class="col-sm-3 card m-4">' +
            generateSlider(('age' + num), 'System Age (Years) - ', -50, 0, 1) +
            generateSlider(('seer' + num), 'SEER - ', 0, 25, 1) +
            generateSlider(('tons' + num), 'Tons of Cooling - ', 0, 100, 1) +
            generateSlider(('num' + num), 'Number of Systems - ', 0, 20, 1) +
            '<button id="remove' + num + '">Remove System</button>' +
            '</div>');
    }
    addSystem() {
        this.listOfSystems.push(new System(5, 9, 1, 13));
        let index = (this.listOfSystems.length - 1);
        this.generateSystem(index);
        $("#age" + index + "Slider").on('input', () => {
            Cust.listOfSystems[index].age = -Number($("#age" + index + "Slider").val());
            $("#seer" + index).text(String(Cust.listOfSystems[index].seer));
            $("#seer" + index + "Slider").val(Cust.listOfSystems[index].seer);
            $("#age" + index).text(String(Cust.listOfSystems[index].age));
        });
        $("#seer" + index + "Slider").on('input', () => {
            Cust.listOfSystems[index].seer = Number($("#seer" + index + "Slider").val());
            $("#seer" + index).text(String(Cust.listOfSystems[index].seer));
        });
        $("#tons" + index + "Slider").on('input', () => {
            Cust.listOfSystems[index].tons = Number($("#tons" + index + "Slider").val());
            $("#tons" + index).text(String(Cust.listOfSystems[index].tons));
        });
        $("#num" + index + "Slider").on('input', () => {
            Cust.listOfSystems[index].num = Number($("#num" + index + "Slider").val());
            $("#num" + index).text(String(Cust.listOfSystems[index].num));
        });
        $("#remove" + index).click(() => {
            $("#system" + index).remove();
            Cust.listOfSystems.splice(index, 1);
        });
        $("#age" + index).text(String(Cust.listOfSystems[index].age));
        $("#tons" + index).text(String(Cust.listOfSystems[index].tons));
        $("#seer" + index).text(String(Cust.listOfSystems[index].seer));
        $("#num" + index).text(String(Cust.listOfSystems[index].num));
        $("#seer" + index + "Slider").val(Cust.listOfSystems[index].seer);
        $("#age" + index + "Slider").val(-Cust.listOfSystems[index].age);
        $("#tons" + index + "Slider").val(Cust.listOfSystems[index].tons);
        $("#num" + index + "Slider").val(Cust.listOfSystems[index].num);
    }
    convertDollar(value) {
        return (value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
    calculateSavings() {
        if (this.allValid()) {
            let totalCostSavings = 0;
            let totalEnergySavings = 0;
            let totalCO2Reduction = 0;
            let resultsString = '';
            for (let system of this.listOfSystems) {
                totalCostSavings += system.savings(this.daysOfOperation, this._equivalentFullLoad, this.kWhPrice);
                totalEnergySavings += system.kwhYearSaving;
                totalCO2Reduction += system.co2Reduction(this.daysOfOperation, this._equivalentFullLoad, this._co2PerKWh);
            }
            resultsString += '<h4>Annual Savings:</h4>' +
                '<p>Total financial savings is $' +
                this.convertDollar(totalCostSavings) +
                '<p>Total energy savings is ' +
                totalEnergySavings.toFixed(0) +
                ' kWh</p><p>Total greenhouse gas reduction is ' +
                totalCO2Reduction.toFixed(2) +
                ' tons of CO2</p><h4>10 Year Projections:</h4><p>Total financial savings is $' +
                this.convertDollar(totalCostSavings * this._tenYearCumulative) +
                '</p><p>Total energy savings is ' +
                (totalEnergySavings * 10).toFixed(0) +
                ' KwH</p><p>Total greenhouse gas reduction is ' +
                (totalCO2Reduction * 10).toFixed(2) +
                ' tons of CO2</p>';
            $("#results").html(resultsString);
            $('#results').append('<div id="email">' +
                '<p>Would you like to email the results?</p>' +
                '    <input type="text" id="emailAddress" name="emailAddress"></input>\n' +
                '<button id="sendEmail">send email</button>' +
                ' </div><p id="sent"></p>');
            $('#sendEmail').click(() => {
                sendResults(resultsString);
            });
        }
        else {
            $("#results").html("Missing Information");
        }
    }
    allValid() {
        if (this.listOfSystems.length > 0 && this.kWhPrice > 0 && this.coolingDegreeDays > 0 && this.daysOfOperation > 0) {
            for (let system of this.listOfSystems) {
                if (!system.validSystem()) {
                    return false;
                }
            }
            return true;
        }
        else {
            return false;
        }
    }
    get coolingDegreeDays() {
        return this._coolingDegreeDays;
    }
    get daysOfOperation() {
        return this._daysOfOperation;
    }
    get kWhPrice() {
        return this._kWhPrice;
    }
}
// represents one system owned by customer
// can have multiple units
class System {
    constructor(tons, age, numSystem, seer) {
        this.btuConversion = 12000;
        this.efficiencyGain = .3;
        this._tons = tons;
        this._age = age;
        if (seer != null) {
            this._seer = seer;
        }
        this._num = numSystem;
        if (seer > 12) {
            this.efficiencyGain -= 0.05;
        }
    }
    // total kWhour used in a year
    kWHourYearTotal(daysOfOperation, equivalentFullLoad) {
        let btuHour = this._tons * this.btuConversion;
        console.log(this._tons);
        console.log(this.btuConversion);
        console.log(btuHour);
        let btuYear = btuHour * equivalentFullLoad;
        let kWHourYearPer = ((btuYear / this._seer) / 1000) *
            (daysOfOperation / 7);
        console.log(kWHourYearPer);
        this._kwhYearUsage = kWHourYearPer * this._num;
        return this._kwhYearUsage;
    }
    // estimated energy savings with coolnomix
    kWHourSavings(daysOfOperation, equivalentFullLoad) {
        this._kwhYearSaving = this.kWHourYearTotal(daysOfOperation, equivalentFullLoad) * this.efficiencyGain;
        return this._kwhYearSaving;
    }
    // estimated co2 reduction per year
    co2Reduction(daysOfOperation, equivalentFullLoad, co2PerKWh) {
        this._yearCO2Saving = this.kWHourSavings(daysOfOperation, equivalentFullLoad) * co2PerKWh;
        return this._yearCO2Saving;
    }
    // estimated dollar value of the savings
    savings(daysOfOperation, equivalentFullLoad, kWhPrice) {
        this._yearPriceSaving = this.kWHourSavings(daysOfOperation, equivalentFullLoad) * kWhPrice;
        return this._yearPriceSaving;
    }
    validSystem() {
        return (this.age > -1 && this.seer > -1 && this.tons > -1 && this.num > -1);
    }
    set tons(value) {
        this._tons = value;
    }
    set seer(value) {
        this._seer = value;
    }
    set age(value) {
        if (value < 14) {
            this.seer = 13;
        }
        else if (value > 14 && value < 28) {
            this.seer = 10;
        }
        else if (value > 28 && value < 33) {
            this.seer = 8;
        }
        else if (value > 33 && value < 39) {
            this.seer = 7;
        }
        else if (value > 40) {
            this.seer = 6;
        }
        this._age = value;
    }
    set num(value) {
        this._num = value;
    }
    get tons() {
        return this._tons;
    }
    get seer() {
        return this._seer;
    }
    get age() {
        return this._age;
    }
    get num() {
        return this._num;
    }
    get kwhYearSaving() {
        return this._kwhYearSaving;
    }
    get yearPriceSaving() {
        return this._yearPriceSaving;
    }
    get yearCO2Saving() {
        return this._yearCO2Saving;
    }
}
function validEmail(text) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
}
//Function to email the calcultor results
function sendResults(summary) {
    let email = $('#emailAddress').val();
    if (validEmail(email)) {
        var key = 'WWRVm63jNPVpeyZQM2KqjA';
        var fromEmail = 'calculator@coolgreenpower.com';
        var url = "https://mandrillapp.com/api/1.0/messages/send.json";
        $.ajax({
            type: "POST",
            url: url,
            data: {
                'key': key,
                'message': {
                    'from_email': fromEmail,
                    'to': [
                        {
                            'email': email,
                            'name': '',
                            'type': 'to'
                        }
                    ],
                    'subject': 'CoolGreenPower AC Calculator',
                    'html': summary
                }
            }
        });
        $('#sent').text("Results Sent to " + email);
        $('#email').hide();
    }
    else {
        $('#sent').text('Invalid Email');
    }
}
class CoolGreenExcel {
    makeWorkbookString() {
        return __awaiter(this, void 0, void 0, function* () {
            let excelUrl = 'https://coolgreenpublicdata.blob.core.windows.net/calc/Web%20Calculator%20Final.csv';
            // create response object, with header data and option to stream data
            let response = yield fetch(excelUrl);
            // get the body of the response, create a reader object, and read it
            let responseResults = yield response.body.getReader().read();
            // decode the uint8array to string
            let responseResults2 = new TextDecoder("utf-8").decode(responseResults.value);
            // parse the string to an array
            this.excelObj = $.csv.toObjects(responseResults2);
        });
    }
}
let Cust = new Customer(0, 5, 0);
function generateSlider(tag, label, min, max, step) {
    return '<div class="card-block"> <label for="' + tag + 'Slider">' + label + '<span id="' + tag + '"></span></label> <br> <input id="' + tag + 'Slider" type="range" class="custom-range" min="' + min + '" max="' + max + '" step="' + step + '"> </div>';
}
$("#sliders").append(generateSlider('rate', 'Electric Rate (per kWh) - $', 0, 0.5, 0.01), generateSlider('cdd', 'Cooling Degree Days - ', 0, 5000, 10), generateSlider('days', 'Days of AC Operation Per Week - ', 0, 7, 1));
$('#add').click(() => {
    Cust.addSystem();
});
function printHTML() {
    return __awaiter(this, void 0, void 0, function* () {
        let excel = new CoolGreenExcel();
        yield excel.makeWorkbookString();
        // Create map instance
        var chart = am4core.create("chartdiv", am4maps.MapChart);
        // Set map definition
        chart.geodata = am4geodata_usaLow;
        // Set projection
        chart.projection = new am4maps.projections.Albers();
        // Create map polygon series
        var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
        polygonSeries.useGeodata = true;
        // Configure series
        var polygonTemplate = polygonSeries.mapPolygons.template;
        polygonTemplate.tooltipText = "{name}";
        polygonTemplate.fill = am4core.color("#9ee0be");
        // Create image series
        var imageSeries = chart.series.push(new am4maps.MapImageSeries());
        // Create a circle image in image series template so it gets replicated to all new images
        var imageSeriesTemplate = imageSeries.mapImages.template;
        var circle = imageSeriesTemplate.createChild(am4core.Circle);
        circle.radius = 6;
        circle.fill = am4core.color("#e03e96");
        circle.nonScaling = true;
        circle.tooltipText = "{title}";
        // Set property fields
        imageSeriesTemplate.propertyFields.latitude = "latitude";
        imageSeriesTemplate.propertyFields.longitude = "longitude";
        imageSeries.data = [];
        excel.excelObj.forEach((obj) => {
            // if(obj.Lat > 35 && obj.Lat < 50 && obj.Lon < -70 && obj.Lon > -100) {
            if (obj.Lat != "") {
                imageSeries.data.push({
                    "latitude": (Number(obj.Lat) + 0.000001),
                    "longitude": (Number(obj.Lon) + 0.000001),
                    "title": obj.City,
                    "cdd": Number(obj.CDD),
                    "rate": Number(obj.Rate).toFixed(2)
                });
            }
        });
        imageSeriesTemplate.events.on("hit", function (ev) {
            let data = ev.target.dataItem.dataContext;
            Cust.coolingDegreeDays = data.cdd;
            Cust.kWhPrice = data.rate;
            $("#location").text("Estimations obtained for " + data.title);
            $("#rate").text(Cust.kWhPrice);
            $("#rateSlider").val(Cust.kWhPrice);
            $("#cdd").text(Cust.coolingDegreeDays);
            $("#cddSlider").val(Cust.coolingDegreeDays);
            $("#days").text(String(Cust.daysOfOperation));
            $("#daysSlider").val(Cust.daysOfOperation);
        });
        // add zoom control
        chart.zoomControl = new am4maps.ZoomControl();
    });
}
$("#rateSlider").on('input', () => {
    Cust.kWhPrice = Number($("#rateSlider").val());
    $("#rate").text(String(Cust.kWhPrice));
});
$("#cddSlider").on('input', () => {
    Cust.coolingDegreeDays = Number($("#cddSlider").val());
    $("#cdd").text(String(Cust.coolingDegreeDays));
});
$("#daysSlider").on('input', () => {
    Cust.daysOfOperation = Number($("#daysSlider").val());
    $("#days").text(String(Cust.daysOfOperation));
});
$('#calculate').click(() => {
    Cust.calculateSavings();
});
printHTML().then();
