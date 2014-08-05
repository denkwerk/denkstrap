(function($,window) {
	// returns an array of objects of the form {url: 'image_url', ratio: float }
	//   array is sorted in asending order by the pixel ratio
	$.parseSrcset = function(text) {
		var result = [],
		 	 items = $.trim(text).split(',');
		for(var i = 0; i< items.length; i++) {
			var img = $.trim(items[i]).split(/\s+/);
			if (img.length < 2) 
				continue;
			var r = { url: img[0] };
			if(img[1].substr(-1,1) == 'x')
				r.ratio = parseFloat( img[1].substr(0,img[1].length -1) );
			r.ratio && result.push(r);
		}
		result.sort(function(a,b) {
			return a.ratio > b.ratio ? 1 : -1;
		});
		return result;
	};
	
	$.fn.srcset = function(dpr) {
		dpr = dpr || window.devicePixelRatio;
		if(!dpr || dpr == 1 || 'srcset' in document.createElement('img'))  {
			return this;
		} 
		return this.each(function() {
			var target_src, 
				 current_ratio = 1,
				 images = $.parseSrcset($(this).attr('srcset'));
			for(var i = 0; i< images.length;i++) {
				if(images[i].ratio > current_ratio) {
					target_src = images[i].url;
					current_ratio = images[i].ratio;
				}
				if(current_ratio >= dpr)
					break;
			}
			target_src && $(this).attr('src',target_src);
		});
	};
	
})(jQuery,window)