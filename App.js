/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useRef, useEffect, useCallback} from 'react';
import styled from 'styled-components/native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {
  Animated,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';

const formatTime = t => {
  const digitize = n => (n < 10 ? `0${n}` : `${n}`);

  const totalSeconds = Math.floor(t % 60);
  const totalMinutes = Math.floor((t / 60) % 60);
  const totalHours = Math.floor((t / 3600) % 60);

  const sec = digitize(totalSeconds);
  const min = digitize(totalMinutes);
  const hr = digitize(totalHours);

  if (totalHours) {
    return `${hr}:${min}:${sec}`;
  } else {
    return `${min}:${sec}`;
  }
};

const App = () => {
  let videoRef = videPlayerRef => {
    videoRef = videPlayerRef;
  };

  const source = {
    uri:
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  };

  let overlayTimer;

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pause, setPause] = useState(false);
  const [overlay] = useState(new Animated.Value(1));
  const [sliderMaxWidth, setSliderMaxWidth] = useState(0);
  const [playableDuration, setPlayableDuration] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const onLoad = video => {
    setDuration(video.duration);
    setIsBuffering(false);
  };

  const onProgress = video => {
    console.log('video ', video);
    if (video.currentTime === currentTime) {
      setIsBuffering(true);
    }
    setPlayableDuration(video.playableDuration);
    setCurrentTime(video.currentTime);
  };

  const stopOverlayAnimation = () => {
    Animated.timing(overlay).stop();
  };

  const hideControls = useCallback(() => {
    Animated.timing(overlay, {
      toValue: 0,
      duration: 5000,
      useNativeDriver: true,
    }).start();
  }, [overlay]);

  const showControls = () => {
    Animated.timing(overlay, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const getPlayableDurationWidth = () => {
    const sliderWidth =
      (playableDuration * Math.round(sliderMaxWidth)) / duration;
    return sliderWidth || 0;
  };

  const onCenteredControlsPress = () => {
    stopOverlayAnimation();
    setPause(!pause);
    hideControls();
    if (!pause) {
      showControls();
    }
  };

  const onEnd = () => {
    setCurrentTime(duration);
  };

  const onSliderValueChange = value => {
    stopOverlayAnimation();
    videoRef.seek(value * duration);
    showControls();
  };

  const onVideoContainerPress = () => {
    // if controls are not visible, show
    if (!pause) {
      Animated.timing(overlay, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        hideControls();
      });
    }
  };

  useEffect(() => {
    if (!pause) {
      hideControls();
    }
  }, [hideControls, overlay, pause]);

  const onSeek = () => {
    if (!pause) {
      hideControls();
    }
  };

  const onFullScreenIconPress = () => {
    setFullScreen(true);
  };
  return (
    <Container>
      <TouchableWithoutFeedback onPress={onVideoContainerPress}>
        <VideoContainer>
          <StyledVideo
            onLoadStart={res => {
              setIsBuffering(true);
            }}
            onBuffer={() => {
              console.log('buffer');
            }}
            fullscreen={fullScreen}
            paused={pause}
            ref={videoRef}
            source={source}
            resizeMode="cover"
            onLoad={onLoad}
            onProgress={onProgress}
            onEnd={onEnd}
            onSeek={onSeek}
            onPlaybackRateChange={data => {
              console.log('onPlaybackRateChange ', data);
            }}
          />
          {isBuffering && (
            <ActivityIndicator
              style={{position: 'absolute', left: '50%', top: '50%'}}
              size="large"
              color="#0000ff"
            />
          )}
          <ControlsContainer style={{opacity: overlay}}>
            <FontAwesome5
              onPress={onCenteredControlsPress}
              name={pause ? 'play' : 'pause'}
              size={36}
              color={'#fff'}
            />
            <TouchableWithoutFeedback
              onPress={() => {
                console.log('BottomControlsContainer');
              }}>
              <BottomControlsContainer>
                <Time>{formatTime(currentTime)}</Time>
                <SliderContainer
                  onLayout={({nativeEvent}) => {
                    const {width} = nativeEvent.layout;
                    setSliderMaxWidth(width);
                  }}>
                  <PlayableDuration width={getPlayableDurationWidth()} />
                  <StyledSlider
                    value={currentTime / duration || 0}
                    onValueChange={onSliderValueChange}
                    minimumValue={0}
                    maximumValue={1}
                    thumbTintColor="#1C1C1C"
                    minimumTrackTintColor="#fff"
                    maximumTrackTintColor="#000"
                  />
                </SliderContainer>
                <Time>{formatTime(duration)}</Time>
                <StyledFontAwesome5
                  name={fullScreen ? 'compress' : 'expand'}
                  size={21}
                  onPress={onFullScreenIconPress}
                  color={'#fff'}
                />
              </BottomControlsContainer>
            </TouchableWithoutFeedback>
          </ControlsContainer>
        </VideoContainer>
      </TouchableWithoutFeedback>
    </Container>
  );
};

const SliderContainer = styled.View`
  flex: 1;
  justify-content: center;
`;

const PlayableDuration = styled.View`
  ${props => `width: ${props.width - 32}px`}
  height: 1px;
  margin-left: 16px;
  background-color: #fff;
  position: absolute;
  border-radius: 4px;
  top: 49%;
`;

const StyledFontAwesome5 = styled(FontAwesome5)`
  margin-left: 8px;
  align-self: center;
`;

const Time = styled.Text`
  font-size: 16px;
  color: #fff;
`;

const BottomControlsContainer = styled.View`
  bottom: 0;
  padding: 8px;
  position: absolute;
  flex-direction: row;
  background-color: rgba(0, 0, 0, 0.5);
`;

const StyledSlider = styled(Slider)`
  flex: 1;
`;

const ControlsContainer = styled(Animated.View)`
  width: 100%;
  height: 100%;
  position: absolute;
  align-items: center;
  justify-content: center;
  z-index: 99;
`;

const StyledVideo = styled(Video)`
  flex: 1;
`;

const VideoContainer = styled.View`
  background-color: red;
  width: 100%;
  height: 210px;
`;

const Container = styled.View`
  flex: 1;
  background-color: #fff;
`;

export default App;
