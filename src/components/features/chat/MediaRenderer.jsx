import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import style from "./MediaRenderer.module.css";
import { MediaStreamContext } from "../../contexts/media-stream-context.js";
import { selectAuth } from "../authSlice";
import { selectMediaChat } from "../mediaChatSlice";

const videoListStyleEnum = {
  PARTY: 1,
  CONFERENCE: 2,
};

function buildVideoListRendererDataSource(
  videoListStyle,
  authenticatedUserId,
  localMediaStream,
  peerUserMediaStreamMap
) {
  const members = [{ userId: authenticatedUserId, userName: "You", mediaStream: localMediaStream }];
  if (
    peerUserMediaStreamMap &&
    peerUserMediaStreamMap.size() > 0 &&
    peerUserMediaStreamMap.peerMap
  ) {
    Array.from(peerUserMediaStreamMap.peerMap.entries()).forEach(([peerId, mediaStream]) => {
      members.push({ userId: peerId, userName: peerId, mediaStream });
    });
  }
  return {
    videoListStyle: videoListStyle,
    members,
    findPresenterByUserId(userId) {
      return members.find((member) => member.userId === userId);
    },
  };
}

export const MediaRendererPropsBuilder = ({}) => {
  return {};
};

export default function MediaRenderer({}) {
  const auth = useSelector(selectAuth);
  const { localMediaStream, peerUserMediaStreamMap } = useContext(MediaStreamContext);
  const [videoListStyle, setVideoListStyle] = useState(videoListStyleEnum.CONFERENCE);

  const handleVideoListStyleChange = (toVideoListStyle) => {
    setVideoListStyle(toVideoListStyle);
  };
  const videoListRendererDataSource = buildVideoListRendererDataSource(
    videoListStyle,
    auth.authenticatedUserId,
    localMediaStream,
    peerUserMediaStreamMap
  );

  return (
    <div className={style.background}>
      <div className={style.switcherContainer}>
        <VideoListStyleSwitcher onListStyleChanged={handleVideoListStyleChange} />
      </div>
      <div className={style.rendererContainer}>
        <VideoListRenderer dataSource={videoListRendererDataSource} />
      </div>
    </div>
  );
}

function VideoListStyleSwitcher({ onListStyleChanged }) {
  const handleSwitcherLeftClicked = (e) => {
    onListStyleChanged(videoListStyleEnum.CONFERENCE);
  };
  const handleSwitcherRightClicked = (e) => {
    onListStyleChanged(videoListStyleEnum.PARTY);
  };

  return (
    <div className={style.switcherBackground}>
      <button onClick={handleSwitcherLeftClicked}>Conference</button>
      <button onClick={handleSwitcherRightClicked}>Party</button>
    </div>
  );
}

function VideoListRenderer({ dataSource }) {
  const [presenterId, setPresenterId] = useState();
  const foundPresenter = dataSource.findPresenterByUserId(presenterId);

  let presenterContainerClass;
  let membersContainerClass;
  let memberContainerClass;
  let handlePresenterIdChange;
  if (dataSource.videoListStyle === videoListStyleEnum.PARTY) {
    presenterContainerClass = `${style.videoListPresenterContainerForParty}`;
    membersContainerClass = `${style.videoListMembersContainerForParty}`;
    memberContainerClass = `${style.videoListMemberContainerForParty}`;
  } else if (dataSource.videoListStyle === videoListStyleEnum.CONFERENCE) {
    presenterContainerClass = `${style.videoListPresenterContainerForConference}`;
    membersContainerClass = `${style.videoListMembersContainerForConference}`;
    memberContainerClass = `${style.videoListMemberContainerForConference}`;
    handlePresenterIdChange = (presenterId) => {
      setPresenterId(presenterId);
    };
  }

  return (
    <div className={style.rendererBackground}>
      <div className={presenterContainerClass}>
        <VideoListMemberRenderer
          userName={foundPresenter ? foundPresenter.userName : "unknown"}
          mediaStream={foundPresenter ? foundPresenter.mediaStream : undefined}
        />
      </div>
      <div className={membersContainerClass}>
        {dataSource.members &&
          dataSource.members.map((member, index) => {
            return (
              <div
                className={memberContainerClass}
                key={index}
              >
                <VideoListMemberRenderer
                  key={index}
                  userId={member.userId}
                  userName={member.userName}
                  mediaStream={member.mediaStream}
                  onPresenterIdChange={handlePresenterIdChange}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}

function VideoListMemberRenderer(props) {
  const userId = props.userId ? props.userId : "unknownId";
  const userName = props.userName ? props.userName : "unknown";
  const mediaStream = props.mediaStream;
  const onPresenterIdChange = props.onPresenterIdChange;

  const addMediaStreamToVideoDOM = (videoDOM, mediaStream) => {
    if (!videoDOM) return;
    videoDOM.srcObject = mediaStream;
  };

  const handleVideoClick = () => {
    if (onPresenterIdChange) {
      onPresenterIdChange(userId);
    }
  };

  return (
    <div className={style.videoListMemberBackground}>
      <div className={style.videoListMemberHeader}>
        <div className={style.videoListMemberHeaderAvatar} />
        <div className={style.videoListMemberHeaderText}>{userName}</div>
      </div>
      {!mediaStream && <div className={style.videoListMemberBackgroundAvatar}>You</div>}
      {mediaStream && (
        <video
          className={style.videoListMemberMediaContent}
          ref={(videoDOM) => {
            addMediaStreamToVideoDOM(videoDOM, mediaStream);
          }}
          autoPlay
          onClick={handleVideoClick}
        ></video>
      )}
    </div>
  );
}
