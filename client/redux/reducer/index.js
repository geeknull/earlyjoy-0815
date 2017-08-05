import * as CONSTANTS from '../actionTypes.js';
import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

let initCntData = {
  cnt: 0,
};

let cnt = (state = initCntData, action) => {
  switch (action.type) {
    case CONSTANTS.ADD_CNT:
      return Object.assign({}, state, {
        cnt: state.cnt+1
      });
  }

  return state;
};

// export default function () {
//   return combineReducers({
//     cnt: cnt,
//     routing: routerReducer
//   });
// };

// 更改用户信息的reducer
// 其中action是 setMyInfo 函数返回的 对象
// 这个对象里面有 type 有 myInfoObj
// myInfoObj就是我们要设置的用户信息
let myInfo = (state={}, action) => {
  if (action.type === CONSTANTS.MY_INFO) {
    return action.myInfoObj;
  }

  return state;
};

export default combineReducers({
  cnt: cnt,
  myInfo: myInfo,
  routing: routerReducer // react-router-redux 中的路由信息
});
