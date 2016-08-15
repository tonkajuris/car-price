$(function(){

	// GLOBAL SELECTED VALUES
	function selection(type){
		return function(){
			var select = $('#' + type + ' option:selected').val();
			return select;
		};
	}
	var makeSelection = selection('make');
	var modelSelection = selection('model');
	var yearSelection = selection('year');
	var selectedStyle = selection('choose-style');

	// SlideShow
	var slideIndex = 0;
	var urlIds = [];
	// End Slideshow

	// GET CAR DATA FROM LOCAL STORAGE
	var getCarData = function(){
		var cars = JSON.parse(window.localStorage.getItem('cars'));
		return cars;
	};

	// GET CAR STYLE DATA FROM LOCAL STORAGE
	var getStyleData = function(){
		var styles = JSON.parse(window.localStorage.getItem('styles'));
		return styles;
	};	

	// BACKGROUND IMAGE HEIGHT
	var windowHeight = $(window).height();
	$('body').css('min-height', windowHeight);

	// INITIAL AJAX CALL FOR CAR DATA
	var request = {
			fmt: 'json',
			api_key: 'XXXXX'
		};
	// Ajax Call to Edmunds.com API	
	$.ajax({
			url: "https://api.edmunds.com/api/vehicle/v2/makes",
			data: request,
			dataType: "json",
			type: "GET",
		})
		.done(function(result){
			console.log(result);
			// List Car Makes in "Select Make" dropdown
			$.each(result.makes, function(i, make){
				$('#make').append('<option value="' + i + '">' + make.name + '</option>');	
			});		
			
			// Loading gif fadeout
			$('.gif, .gif-background').fadeOut(300);

			// Store Car Data in localStorage
			var carData = JSON.stringify(result);
			window.localStorage.setItem('cars', carData);
		});	

	
	// SELECT MAKE
	$('#make').change(function(){

		$('.warning').slideUp(200);
		// Removes previous car models & years if a make had been previously selected 
		$('#model option').slice(1).remove();
		$('#year option').slice(1).remove();
		// Hides car-name, car-result & prices divs if user re-selects
		$('.car-name').hide();
		$('.car-result').hide();
		$('.prices').hide();
		// Add Make Name to .car-name h2 tag
		var makeText = $('#make option:selected').text();
		$('#make-name').text(makeText);
		// List Models in "Select Model" dropdown
		var carMake = makeSelection();		
		var carData = getCarData();		
		$.each(carData.makes[carMake].models, function(i, model){
			$('#model').append('<option value="' + i + '">' + model.name + '</option>');
		});
	});

	// SELECT MODEL
	$('#model').change(function(){

		$('.warning').slideUp(200);
		// Removes previous model years if a year had previously been selected
		$('#year option').slice(1).remove();
		// Hides car-name, car-result & prices divs if user re-selects
		$('.car-name').hide();
		$('.car-result').hide();
		$('.prices').hide();
		// Add Model Name to .car-name h2 tag	
		var modelText = $('#model option:selected').text();
		$('#model-name').text(modelText);
		// List Years in "Select Year" dropdown
		var carMake = makeSelection();
		var carModel = modelSelection();
		var carData = getCarData();
		$.each(carData.makes[carMake].models[carModel].years, function(i, years){
			$('#year').append('<option value="' + i + '">' + years.year + '</option>');
		});
	});

	// SELECT YEAR
	$('#year').change(function(){

		$('.warning').slideUp(200);
		// Hides car-name, car-result & prices divs if user re-selects
		$('.car-name').hide();
		$('.car-result').hide();
		$('.prices').hide();
		//Add Year to .car-name h2 tag
		var yearText = $('#year option:selected').text();
		$('#year-name').text(yearText);
	});



	// CLICK GO BUTTON
	$('#go-button').click(function(){
		var carMake = makeSelection();
		var carModel = modelSelection();
		var carYear = yearSelection();
		
		if (carMake === "Select Make" || carModel === "Select Model" || carYear === "Select Year") {
			// If user doesn't select a make, model or year
			$('.warning').slideDown(200);
		} 
		else {	
			// Get Styles of car selected
			var carData = getCarData();
			var make = carData.makes[carMake].niceName;
			var model = carData.makes[carMake].models[carModel].niceName;
			var year = carData.makes[carMake].models[carModel].years[carYear].year;
			getCarStyles(make, model, year);
		}	
	});	

	// AJAX CALL TO GET STYLES OF CAR SELECTED
	var getCarStyles = function(make, model, year){
		
		var request = {
			fmt: 'json',
			api_key: 'XXX'			
		};
		// Ajax Call to Edmunds.com API
		$.ajax({
			url: "https://api.edmunds.com/api/vehicle/v2/"+make+"/"+model+"/"+year+"/styles",
			data: request,
			dataType: "json",
			type: "GET",
		}) 
		.done(function(result){
			console.log(result);
			// Store car styles in localStorage
			var carStyles = JSON.stringify(result);
			window.localStorage.setItem('styles', carStyles);
			// Show car styles
			showCarStyles();
		});
	};

	// SHOW CAR STYLES FOR USER TO SELECT
	var showCarStyles = function(){
		var carStyles = getStyleData();
		console.log(carStyles);
		// SlideDown .car-name section
		$('#choose-style option').slice(1).remove();
		$('.car-name').slideDown(300);
		// List Car Styles in "Choose Style" dropdown
		$.each(carStyles.styles, function(i, style){
			$('#choose-style').append('<option value="'+i+'">' + style.name + '</option>');
		});
	};

	// CHOOSE STYLE
	$('#choose-style').change(function(){
		// Add car style to h3 tag
		var styleText = $('#choose-style option:selected').text();
		$('.car-style').text(styleText);
	});

	// CLICK START APPRAISAL
	$('#start-appraise').click(function(){
		var carStyles = getStyleData();
		var style = selectedStyle();
		var styleId = carStyles.styles[style].id;
		console.log(styleId);
		// Get image of car selected
		getCarPic(styleId);
	});

	// AJAX CALL TO GET PICTURE OF CAR SELECTED
	var getCarPic = function(Id){

		// Start loading gif
		$('.gif, .gif-background').show();

		var request = {
			styleId: Id,
			fmt: 'json',
			comparator: 'simple' ,			
			api_key: 'XXX'
		};
		// Ajax Call to Edmunds.com API
		$.ajax({
			url: "https://api.edmunds.com/v1/api/vehiclephoto/service/findphotosbystyleid",
			data: request,
			dataType: "json",
			type: "GET",
			// success: function(msg){
			// 		alert( "Data Saved: " + msg );
			// },
			// error: function(XMLHttpRequest, textStatus, errorThrown) {
			// 	alert("XHR:\r\n" + XMLHttpRequest + "Error:\r\n" + errorThrown + "\r\n Status:\r\n" + textStatus);
			// }
		})
		.done(function(result){
			console.log(result);
			getImgArray(result);
			fillInElements();
			// var url = result[0].id;
			// var imgUrl = url.slice(9);
			// Show car img and appraisal details		
			// $('#car-image').attr('src', 'http://media.ed.edmunds-media.com' + imgUrl + '_500.jpg');
			// console.log('#car-image load function');
			// $('#car-image').load(function(){
				$('.gif, .gif-background').fadeOut(500);
				$('.car-result').slideDown(500);
			// 	$('html, body').animate({scrollTop: $('#car-image').offset().top }, 1000);			
			// });
			carousel();
		});
	};
	// carousel();
	
	//Slideshow
	function getImgArray(result){
		result.forEach(function(element) {
			// urlIds.push(element.id);
			element.photoSrcs.forEach(function(src) {
				urlIds.push(src);
			}, this);
		}, this);
	}
	function fillInElements()
	{
		var i;
		var x = document.getElementsByClassName("mySlides");
		for (i = 0; i < x.length; i++) {
			// x[i].style.display  = "none"; 
			console.log(x[i]);
			x[i].src = 'http://media.ed.edmunds-media.com' + urlIds[i];
		}
	}
	function carousel() {
		var i;
		var x = document.getElementsByClassName("mySlides");
		for (i = 0; i < x.length; i++) {
		x[i].style.display  = "none"; 
		}
		slideIndex++;
		if (slideIndex > x.length) {
			slideIndex = 1;
		} 
		x[slideIndex-1].style.display = "block"; 
		setTimeout(carousel,  2000); // Change image every 2 seconds
	}
	//slideshow
	
	// CLICK PRICE MY RIDE BUTTON
	$('#appraise-car').click(function(){
		var carStyles = getStyleData();
		var style = selectedStyle();
		var id = carStyles.styles[style].id;
		var condition = $('#condition option:selected').val();
		var mileage = $('#mileage').val();
		var zip = $('#zipcode').val();
		if (condition === "" || mileage === "" || zip === "") {
			// If details are not filled in
			$('.details-warning').slideDown(200);
		}
		else {		
			// Get True Market Value of Car
			$('.details-warning').delay(300).slideUp(200);	
			getTmv(id, condition, mileage, zip);
		}		
	});

	// AJAX CALL TO GET TRUE MARKET VALUE
	var getTmv = function(id, condition, mileage, zip){

		var request = {
			styleid: id,
			condition: condition,
			mileage: mileage,
			zip: zip,
			fmt: 'json',
			api_key: 'XXX'
		};
		// Ajax Call to Edmunds.com API
		$.ajax({
			url: "https://api.edmunds.com/v1/api/tmv/tmvservice/calculateusedtmv",
			data: request,
			dataType: "json",
			type: "GET",
		}) 
		.done(function(result){
			console.log(result);
			// Show prices section and display prices
			$('.trade-in p').text('$' + result.tmv.totalWithOptions.usedTradeIn);
			$('.private p').text('$' + result.tmv.totalWithOptions.usedPrivateParty);
			$('.dealer p').text('$' + result.tmv.totalWithOptions.usedTmvRetail);
			$('.prices').slideDown(500);
			$('html, body').animate({scrollTop: $('.prices').offset().top }, 1000);			
		});
	};

	// CLICK ON INFO BUTTONS
	$('.car-condition i').click(function(){
		$('.popup').show();
	});

	$('#close-popup').click(function(){
		$('.popup').hide();
	});

	$('.prices h3 i').click(function(){
		$('.prices-popup').show().find('p').text('This price is the Edmunds.com TMV® price. It is Edmunds.com’s determination of the current average base price in the area indicated by the Zipcode provided, unadjusted for color or any options.');
	});

	$('.trade-in i').click(function(){
		$('.prices-popup').show().find('p').text('This is the amount you can expect to receive when you trade in your used car and purchase a new car. The trade-in price is usually credited as a down payment on the new car.');
	});

	$('.private i').click(function(){
		$('.prices-popup').show().find('p').text('This is the amount at which the car is sold to or purchased by a private party, not a car dealer. This amount is usually more than the trade-in price but less than the dealer retail price.');
	});

	$('.dealer i').click(function(){
		$('.prices-popup').show().find('p').text('Dealer Retail is what other customers have paid for similar cars in your area. Dealer retail will usually be higher than private party prices and much higher than trade-in prices.');
	});

	$('#close-prices-popup').click(function(){
		$('.prices-popup').hide();
	});
});

