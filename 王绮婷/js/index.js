window.onload = function () {

	//封装获取id元素方法
	function getId(id) {
		return document.getElementById(id);
	}

	//是否已经加载音频资源
	var isLoadAudio = false;

	//音乐进度层
	var layer = getId('layer');

	//滑块
	var mask = getId('mask');
	//获取mask的宽度
	var maskWidth = mask.clientWidth;

	//获取未激活进度的宽度
	var progressParent = getId('progressParent');
	var progressParentWidth = progressParent.clientWidth;

	//获取当前controls元素相对整个页面的左边的偏移距离
	var offsetLeft = getId('controls').offsetLeft;

	//激活的进度条
	var progress = getId('progress');

	//移动mask
	function moveMask(e) {
		//获取手指相对于整个页面的横向坐标
		var pageX = e.touches[0].pageX;

		//mask移动的距离
		var x = pageX - offsetLeft - maskWidth / 2;

		//mask最大移动的距离
		var maxX = progressParentWidth - maskWidth / 2;

		//mask最小的移动距离
		var minX = -maskWidth / 2;

		x = x >= maxX ? maxX : x <= minX ? minX : x;

		mask.style.left = x + 'px';

		//改变激活进度条的宽度
		progress.style.width = x + maskWidth / 2 + 'px';

		//设置当前播放时间
		audio.currentTime = (x + maskWidth / 2) / progressParentWidth * audio.duration;


	}


	layer.ontouchstart = function (e) {

		if (!isLoadAudio) {return;};
		moveMask(e);

	}

	layer.ontouchmove = function (e) {

		if (!isLoadAudio) {return;};
		moveMask(e);

	}

	//切换播放和暂停按钮
	var isPlay = false;
	$('#play').on('click', function () {

		//获取当前播放模式
		var mode = $('#playMode').data('mode');
		if (mode == 'exchange') {
			//列表顺序播放
			played();

		} else if(mode == 'loop') {
			//单曲循环
			simpleLoopPlay();

		} else if (mode == 'random') {
			//随机播放
			randomPlay();
		}

		var $i = $(this).find('.playing-i');
		if (isPlay) {
			//停止播放
			$i.removeClass('fa-pause').addClass('fa-play');
			isPlay = false;

			//停止音乐
			audio.pause();

			$('#list').find('li.audio-active').find('i').removeClass('fa-pause').addClass('fa-play').end().data('play', false);

			//停止碟子旋转
			$('#photo').css({'animation-play-state': 'paused'});
		} else {
			//播放
			$i.removeClass('fa-play').addClass('fa-pause');
			isPlay = true;

			//播放音乐
			audio.play();

			$('#list').find('li.audio-active').find('i').removeClass('fa-play').addClass('fa-pause').end().data('play', true);

			//碟子旋转
			$('#photo').css({'animation-play-state': 'running'});

			var imgSrc = $('#list').find('li.audio-active').find('.auto-img').attr('src');
			$('#singerImg').find('.auto-img').attr('src', imgSrc);

			$('#photo').css({'background-image': 'url(' + imgSrc + ')'});
		}

	})

	//切换播放模式
	$('#playMode').on('click', function () {
		$('#playModeMore').slideToggle(300);
		$('#modifyVolume').slideUp(300);
	})

	//修改音量
	$('#volume').on('click', function (e) {

		$('#playModeMore').slideUp(300);

		if ($(e.target).attr('id') == 'volumeLayer') {
			return;
		}

		$('#modifyVolume').slideToggle(300);
		
	})

	//切换写真面板
	$('#singerImg').on('click', function () {
		$('#photography').toggle(300);
	})

	//关闭写真面板
	$('#close').on('click', function () {
		$('#photography').toggle(300);
	})

	//移动音量mask
	var volumeMask = getId('volumeMask');
	var volumeMaskHeight = parseInt(window.getComputedStyle(volumeMask).height);

	//获取音量层的偏移距离
	var $modifyVolume = $('#modifyVolume');
	var height = $modifyVolume.innerHeight();

	var $volumeLayer = $('#volumeLayer');
	var volumeLayerHeight = $volumeLayer.height();

	var musicControl = getId('musicControl');
	var offsetTop = musicControl.offsetTop - height + (height - volumeLayerHeight) / 2 + 30;

	//获取未激活音量进度条高度
	var volumeNotActiveHeight = $('#volumeNotActive').height();

	//音量激活层元素
	var volumeActive = getId('volumeActive');

	//音量事件层
	var volumeLayer = getId('volumeLayer');
	volumeLayer.ontouchstart = function (e) {
		moveVolumeMask(e);
	}

	volumeLayer.ontouchmove = function (e) {
		moveVolumeMask(e);
	}

	function moveVolumeMask(e) {
		// e.preventDefault();
		//获取手指相对于整个页面的横向坐标
		var pageY = e.touches[0].pageY;

		//mask移动的距离
		var y = pageY - offsetTop - volumeMaskHeight / 2;

		//mask最大移动的距离
		var maxY = volumeNotActiveHeight + volumeMaskHeight / 2 +　3;

		//mask最小的移动距离
		var minY = 9;

		y = y >= maxY ? maxY : y <= minY ? minY : y;

		volumeMask.style.top = volumeNotActiveHeight - y + 2 * minY + 'px';

		//改变激活进度条的宽度
		volumeActive.style.height = volumeNotActiveHeight - y - minY + 2 * minY + 'px';

		var percent = (volumeNotActiveHeight - y - minY + 2 * minY) / volumeNotActiveHeight;

		audio.volume = percent;

	}


	//列表播放歌曲
	var audio = $('#audio')[0];
	var volume = audio.volume;
	volumeMask.style.top = (volumeNotActiveHeight - volumeMaskHeight / 2 + 18) * volume + 'px';
	volumeActive.style.height = volumeNotActiveHeight * volume + 'px';


	var $play = $('#play');

	var $lis = $('#list>li');
	$lis.on('click', function () {

		isLoadAudio = true;

		if (!$(this).hasClass('audio-active')) {

			$(this).addClass('audio-active').siblings().removeClass('audio-active');

			//获取当前li自定义的data属性
			var url = $(this).data('url');

			audio.src = url;

			audio.play();

			$(this).find('i').removeClass('fa-play').addClass('fa-pause').end().siblings().find('i').removeClass('fa-pause').addClass('fa-play');

			$(this).data('play', true).siblings().data('play', false);

			$play.find('i').removeClass('fa-play').addClass('fa-pause');

			//转动碟子
			$('#photo').css({'animation-play-state': 'running'});

			isPlay = true;

			var imgSrc = $(this).find('.auto-img').attr('src');
			$('#singerImg').find('.auto-img').attr('src', imgSrc);

			$('#photo').css({'background-image': 'url(' + imgSrc + ')'});

		} else {
			//点击相同的li, 那么只做停止或者播放音乐

			var isPlaying = $(this).data('play');


			if (isPlaying) {
				//如果播放，那么停止
				audio.pause();

				$(this).find('i').removeClass('fa-pause').addClass('fa-play');
				$play.find('i').removeClass('fa-pause').addClass('fa-play');

				//停止转动碟子
				$('#photo').css({'animation-play-state': 'paused'});

				isPlay = false;

			} else {
				//如果停止，那么播放
				audio.play();

				$(this).find('i').removeClass('fa-play').addClass('fa-pause');

				$play.find('i').removeClass('fa-play').addClass('fa-pause');

				//转动碟子
				$('#photo').css({'animation-play-state': 'running'});

				isPlay = true;

			}

			$(this).data('play', !isPlaying);

		}
	

	})

	//监听音乐的实时变化

	function formatTime(selector, time) {
		var hours = Math.floor(time / 60 / 60 % 60);
		hours = hours >= 10 ? hours : '0' + hours;

		var minutes = Math.floor(time / 60 % 60);
		minutes = minutes >= 10 ? minutes : '0' + minutes;

		var seconds = Math.floor(time % 60);
		seconds = seconds >= 10 ? seconds : '0' + seconds;

		$(selector).text(hours + ':' + minutes + ':' + seconds);
	}

	audio.ontimeupdate = function () {

		//总时长
		var duration = this.duration;
		if (!isNaN(duration)) {
			//当前的播放时间
			var currentTime = this.currentTime;
		
			//获取当前时间和总时间的百分比
			var percent = currentTime / duration;

			var activeWidth = progressParentWidth * percent;

			//设置激活进度条的宽度
			progress.style.width = activeWidth + 'px';

			//小滑块移动距离
			mask.style.left = activeWidth - maskWidth / 2 + 'px';

			//设置总时间文本
			formatTime('#duration', duration);

			//设置当前时间文本
			formatTime('#currentTime', currentTime);

			if (activeWidth == progressParentWidth) {

				//播放完成当前音频, 根据播放模式播放下一首
				var mode = $('#playMode').data('mode');

				if (mode == 'exchange') {
					//列表顺序播放
					played('next');
				} else if (mode == 'loop') {
					//单曲循环
					simpleLoopPlay('next');
				} else if (mode == 'random') {
					//随机播放
					randomPlay('next');
				}

				var imgSrc = $('#list').find('li.audio-active').find('.auto-img').attr('src');

				$('#singerImg').find('.auto-img').attr('src', imgSrc);

				$('#photo').css({
					'background-image': 'url(' + imgSrc + ')',
					'animation-play-state': 'running'
				});

			}

		}

	}

	//监听音频停止事件
	/*
	audio.onpause = function () {

		//当前播放时间
		var currentTime = $('#currentTime').text();

		//播放总时间
		var duration = $('#duration').text();

		console.log('currentTime ==> ', currentTime);
		console.log('duration ==> ', duration);

		if (currentTime != duration) {
			return;
		}

		//播放完成当前音频, 根据播放模式播放下一首
		var mode = $('#playMode').data('mode');

		if (mode == 'exchange') {
			//列表顺序播放
			played('next');
		} else if (mode == 'loop') {
			//单曲循环
			simpleLoopPlay('next');
		} else if (mode == 'random') {
			//随机播放
			randomPlay('next');
		}

		var imgSrc = $('#list').find('li.audio-active').find('.auto-img').attr('src');

		$('#singerImg').find('.auto-img').attr('src', imgSrc);

		$('#photo').css({
			'background-image': 'url(' + imgSrc + ')',
			'animation-play-state': 'running'
		});

	}
	*/


	//切换模式
	$('#playModeMore>div').on('click', function () {

		var currentIcon = $('#playMode').data('icon');

		var mode = $(this).data('mode');

		var icon = $(this).data('icon');

		$('#playMode').data('mode', mode).data('icon', icon).find('.play-mode-icon>i').removeClass(currentIcon).addClass(icon);

		console.log($('#playMode').data('mode'));
		console.log($('#playMode').data('icon'));

	})


	//模式选择
	//随机模式
	function randomPlay(toggle) {
		//获取所有li
		var $lis = $('#list>li');

		//获取一个激活的li
		var $activeLi = $('#list>li.audio-active')[0];

		//获取随机下标
		var randomIndex = Math.floor(Math.random() * $lis.length);

		
		
		if ($activeLi) {
			//如果存在被激活的li
			//直接播放

			//上下首切换
			if (toggle) {
				$lis.eq(randomIndex).addClass('audio-active').siblings().removeClass('audio-active');

				$lis.eq(randomIndex).data('play', true).find('i').addClass('fa-pause').removeClass('fa-play');

				//如果当前激活的li和随机激活的li不一致
				if (!($lis.eq(randomIndex)[0] == $activeLi)) {

					$($activeLi).data('play', false).find('i').addClass('fa-play').removeClass('fa-pause');
		
				}

				//加载audio
				
						audio.src = $lis.eq(randomIndex).data('url');

						audio.play();
				

				$('#play').find('i').addClass('fa-pause').removeClass('fa-play');

				isPlay = true;

			}

		} else {

			//播放暂停按钮
			//修改音频已加载状态
			isLoadAudio = true;
			//加载audio
			audio.src = $lis.eq(randomIndex).data('url');
			$lis.eq(randomIndex).addClass('audio-active');

		}

		
	}

	//单曲循环
	function simpleLoopPlay(toggle) {

		//获取所有li
		var $lis = $('#list>li');

		//获取一个激活的li
		var $activeLi = $('#list>li.audio-active')[0];

		if ($activeLi) {
			//如果存在被激活的li
			//直接播放

			if (toggle) {
				audio.load();
				audio.play();

				$($activeLi).data('play', true).find('i').addClass('fa-pause').removeClass('fa-play');
				$('#play').find('i').addClass('fa-pause').removeClass('fa-play');

				isPlay = true;
			}

		} else {

			//修改音频已加载状态
			isLoadAudio = true;

			var $firstLi = $lis.eq(0);

			$firstLi.addClass('audio-active');

			audio.src = $firstLi.data('url');

		}

	}
	function togglePlay($lis, $activeLi, index) {
		//下一个激活的li
		var $lastLi = $lis.eq(index);

		$lastLi.addClass('audio-active').siblings().removeClass('audio-active');

		//修改当前播放状态
		$($activeLi).data('play', false);
		$($activeLi).find('i').addClass('fa-play').removeClass('fa-pause');

		$lastLi.data('play', true);
		$lastLi.find('i').addClass('fa-pause').removeClass('fa-play');

		audio.src = $lastLi.data('url');

		audio.play();

		$('#play').find('i').addClass('fa-pause').removeClass('fa-play');

		isPlay = true;
	}
	//列表顺序播放
	function played(toggle) {

		//获取所有li
		var $lis = $('#list>li');

		//获取一个激活的li
		var $activeLi = $('#list>li.audio-active')[0];

		if ($activeLi) {
			//如果存在被激活的li
			//直接播放

			//获取当前激活的li下标
			var index = $($activeLi).index();

			if (toggle == 'prev') {
				//上一首
				index = index == 0 ? $lis.length - 1 : --index;

				togglePlay($lis, $activeLi, index);

			} else if (toggle == 'next') {
				//下一首
				index = index == $lis.length - 1 ? 0 : ++index;

				togglePlay($lis, $activeLi, index);

			}


		} else {

			//修改音频已加载状态
			isLoadAudio = true;

			var $firstLi = $lis.eq(0);

			$firstLi.addClass('audio-active');

			audio.src = $firstLi.data('url');

		}

	}

	// 切换上下首
	//上一首
	$('#prev').on('click', function () {

		// 获取激活的li
		var $activeLi = $('#list>li.audio-active');
		if (!$activeLi[0]) {
			//如果当前没有激活li, 直接拦截
			return;
		}

		//获取当前模式
		var mode = $('#playMode').data('mode');

		if (mode == 'exchange') {
			//列表顺序播放
			played('prev');
		} else if (mode == 'loop') {
			//单曲循环
			simpleLoopPlay('prev');
		} else if (mode == 'random') {
			//随机播放
			randomPlay('prev');
		}

		var imgSrc = $('#list').find('li.audio-active').find('.auto-img').attr('src');
		$('#singerImg').find('.auto-img').attr('src', imgSrc);

		//转动碟子同时设置背景
		$('#photo').css({
			'background-image': 'url(' + imgSrc + ')',
			'animation-play-state': 'running'
		});

		

	})

	//下一首
	$('#next').on('click', function () {

		// 获取激活的li
		var $activeLi = $('#list>li.audio-active');
		if (!$activeLi[0]) {
			//如果当前没有激活li, 直接拦截
			return;
		}

		//获取当前模式
		var mode = $('#playMode').data('mode');

		if (mode == 'exchange') {
			//列表顺序播放
			played('next');
		} else if (mode == 'loop') {
			//单曲循环
			simpleLoopPlay('next');
		} else if (mode == 'random') {
			//随机播放
			randomPlay('next');
		}

		var imgSrc = $('#list').find('li.audio-active').find('.auto-img').attr('src');

		$('#singerImg').find('.auto-img').attr('src', imgSrc);

		$('#photo').css({
			'background-image': 'url(' + imgSrc + ')',
			'animation-play-state': 'running'
		});

	})


}