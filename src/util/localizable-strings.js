export const localeTypeEnum = Object.freeze({
  ENGLISH: "English",
  CHINESE: "Chinese",
});

export const localizableStringKeyEnum = Object.freeze({
  /**
   * Sign in
   */
  SIGN_IN_TITLE: "SIGN_IN_TITLE",
  SIGN_IN_TITLE_DESC: "SIGN_IN_TITLE_DESC",
  SIGN_IN_INPUT_PLACEHOLDER: "SIGN_IN_INPUT_PLACEHOLDER",
  SIGN_IN_COMFIRM: "SIGN_IN_COMFIRM",
  /**
   * Room list
   */
  ROOM_LIST_CREATE_NEW_ROOM_TITLE: "ROOM_LIST_CREATE_NEW_ROOM_TITLE",
  ROOM_LIST_CREATE_NEW_ROOM_INPUT_PLACEHOLDER: "ROOM_LIST_CREATE_NEW_ROOM_INPUT_PLACEHOLDER",
  ROOM_LIST_CREATE_NEW_ROOM_COMFIRM: "ROOM_LIST_CREATE_NEW_ROOM_COMFIRM",
  ROOM_LIST_JOIN_ROOM: "ROOM_LIST_JOIN_ROOM",
  /**
   * Navigation
   */
  NAVIGATION_ROOM_LIST_TITLE: "NAVIGATION_ROOM_LIST_TITLE",
  NAVIGATION_CREATE_NEW_ROOM: "NAVIGATION_CREATE_NEW_ROOM",
  NAVIGATION_WELCOME: "NAVIGATION_WELCOME",
  NAVIGATION_LOCALIZATION_SELECTED_TEXT: "NAVIGATION_LOCALIZATION_SELECTED_TEXT",
  NAVIGATION_LOCALIZATION_ENGLISH_ITEM_TEXT: "NAVIGATION_LOCALIZATION_ENGLISH_ITEM_TEXT",
  NAVIGATION_LOCALIZATION_CHINESE_ITEM_TEXT: "NAVIGATION_LOCALIZATION_CHINESE_ITEM_TEXT",
  NAVIGATION_SIGN_OUT: "NAVIGATION_SIGN_OUT",
  /**
   * Chat room
   */
  CHAT_ROOM_MEDIA_CONSTRAINT_CAMERA: "CHAT_ROOM_MEDIA_CONSTRAINT_CAMERA",
  CHAT_ROOM_MEDIA_CONSTRAINT_SCREEN: "CHAT_ROOM_MEDIA_CONSTRAINT_SCREEN",
  CHAT_ROOM_MESSAGE_TYPE_TEXT: "CHAT_ROOM_MESSAGE_TYPE_TEXT",
  CHAT_ROOM_MESSAGE_TYPE_FILE: "CHAT_ROOM_MESSAGE_TYPE_FILE",
  CHAT_ROOM_MESSAGE_TEXT_INPUT_PLACEHOLDER: "CHAT_ROOM_MESSAGE_TEXT_INPUT_PLACEHOLDER",
  CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_IDLE: "CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_IDLE",
  CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE: "CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE",
  CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE_PLURAL:
    "CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE_PLURAL",
  CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_ADDED: "CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_ADDED",
  /**
   * Time description
   */
  YEARS_AGO: "YEARS_AGO",
  MONTHS_AGO: "MONTHS_AGO",
  DAYS_AGO: "DAYS_AGO",
  HOURS_AGO: "HOURS_AGO",
  MINUTES_AGO: "MINUTES_AGO",
  SECONDS_AGO: "SECONDS_AGO",
});

export const localizableStrings = Object.freeze({
  [localeTypeEnum.ENGLISH]: {
    /**
     * Sign in
     */
    [localizableStringKeyEnum.SIGN_IN_TITLE]: "WebRTC Group Chat",
    [localizableStringKeyEnum.SIGN_IN_TITLE_DESC]: "Make P2P features possible",
    [localizableStringKeyEnum.SIGN_IN_INPUT_PLACEHOLDER]: "Enter your username ...",
    [localizableStringKeyEnum.SIGN_IN_COMFIRM]: "Sign in",
    /**
     * Room list
     */
    [localizableStringKeyEnum.ROOM_LIST_CREATE_NEW_ROOM_TITLE]: "Create New Room",
    [localizableStringKeyEnum.ROOM_LIST_CREATE_NEW_ROOM_INPUT_PLACEHOLDER]:
      "Enter your new room name ...",
    [localizableStringKeyEnum.ROOM_LIST_CREATE_NEW_ROOM_COMFIRM]: "Confirm",
    [localizableStringKeyEnum.ROOM_LIST_JOIN_ROOM]: "Join",
    /**
     * Navigation
     */
    [localizableStringKeyEnum.NAVIGATION_ROOM_LIST_TITLE]: "Avaliable Chat Rooms",
    [localizableStringKeyEnum.NAVIGATION_CREATE_NEW_ROOM]: "New",
    [localizableStringKeyEnum.NAVIGATION_WELCOME]: "Hi",
    [localizableStringKeyEnum.NAVIGATION_LOCALIZATION_SELECTED_TEXT]: "EN",
    [localizableStringKeyEnum.NAVIGATION_LOCALIZATION_ENGLISH_ITEM_TEXT]: "English",
    [localizableStringKeyEnum.NAVIGATION_LOCALIZATION_CHINESE_ITEM_TEXT]: "中文",
    [localizableStringKeyEnum.NAVIGATION_SIGN_OUT]: "Sign out",
    /**
     * Chat room
     */
    [localizableStringKeyEnum.CHAT_ROOM_MEDIA_CONSTRAINT_CAMERA]: "Camera",
    [localizableStringKeyEnum.CHAT_ROOM_MEDIA_CONSTRAINT_SCREEN]: "Screen",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TYPE_TEXT]: "Text Message",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TYPE_FILE]: "File Message",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TEXT_INPUT_PLACEHOLDER]: "Write text here ...",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_IDLE]:
      "Click here to add files",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE]: "file",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE_PLURAL]: "s",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_ADDED]: "added",
    /**
     * Time description
     */
    [localizableStringKeyEnum.YEARS_AGO]: "years ago",
    [localizableStringKeyEnum.MONTHS_AGO]: "months ago",
    [localizableStringKeyEnum.DAYS_AGO]: "days ago",
    [localizableStringKeyEnum.HOURS_AGO]: "hours ago",
    [localizableStringKeyEnum.MINUTES_AGO]: "minutes ago",
    [localizableStringKeyEnum.SECONDS_AGO]: "seconds ago",
  },
  [localeTypeEnum.CHINESE]: {
    /**
     * 登陆
     */
    [localizableStringKeyEnum.SIGN_IN_TITLE]: "WebRTC聊天室",
    [localizableStringKeyEnum.SIGN_IN_TITLE_DESC]: "让去中心化的功能成为可能",
    [localizableStringKeyEnum.SIGN_IN_INPUT_PLACEHOLDER]: "请输入用户名 ...",
    [localizableStringKeyEnum.SIGN_IN_COMFIRM]: "登陆",
    /**
     * 房间列表
     */
    [localizableStringKeyEnum.ROOM_LIST_CREATE_NEW_ROOM_TITLE]: "新建房间",
    [localizableStringKeyEnum.ROOM_LIST_CREATE_NEW_ROOM_INPUT_PLACEHOLDER]: "请输入房间名 ...",
    [localizableStringKeyEnum.ROOM_LIST_CREATE_NEW_ROOM_COMFIRM]: "确定",
    [localizableStringKeyEnum.ROOM_LIST_JOIN_ROOM]: "加入",
    /**
     * 导航栏
     */
    [localizableStringKeyEnum.NAVIGATION_ROOM_LIST_TITLE]: "房间列表",
    [localizableStringKeyEnum.NAVIGATION_CREATE_NEW_ROOM]: "新建",
    [localizableStringKeyEnum.NAVIGATION_WELCOME]: "你好",
    [localizableStringKeyEnum.NAVIGATION_LOCALIZATION_SELECTED_TEXT]: "中文",
    [localizableStringKeyEnum.NAVIGATION_LOCALIZATION_ENGLISH_ITEM_TEXT]: "English",
    [localizableStringKeyEnum.NAVIGATION_LOCALIZATION_CHINESE_ITEM_TEXT]: "中文",
    [localizableStringKeyEnum.NAVIGATION_SIGN_OUT]: "注销",
    /**
     * 聊天室
     */
    [localizableStringKeyEnum.CHAT_ROOM_MEDIA_CONSTRAINT_CAMERA]: "摄像头",
    [localizableStringKeyEnum.CHAT_ROOM_MEDIA_CONSTRAINT_SCREEN]: "屏幕录制",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TYPE_TEXT]: "文字消息",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TYPE_FILE]: "文件消息",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_TEXT_INPUT_PLACEHOLDER]: "请输入文字消息 ...",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_IDLE]: "点击此处添加文件",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE]: "个文件",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_FILE_PLURAL]: "",
    [localizableStringKeyEnum.CHAT_ROOM_MESSAGE_FILE_INPUT_PLACEHOLDER_ADDED]: "",
    /**
     * 时间描述
     */
    [localizableStringKeyEnum.YEARS_AGO]: "年前",
    [localizableStringKeyEnum.MONTHS_AGO]: "月前",
    [localizableStringKeyEnum.DAYS_AGO]: "天前",
    [localizableStringKeyEnum.HOURS_AGO]: "小时前",
    [localizableStringKeyEnum.MINUTES_AGO]: "分钟前",
    [localizableStringKeyEnum.SECONDS_AGO]: "秒前",
  },
});
