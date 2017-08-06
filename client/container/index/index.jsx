import React, { Component } from 'react';
import { connect } from 'react-redux';
import actions from '../../redux/actions/index.js';
import { ajax } from '../../util/index.js';

@connect((state) => {
  return {
    myInfo: state.myInfo
  }
},{...actions})
export default class extends Component {
  constructor () {
    super();
    this.state = {
      // 个人信息【默认值】
      userInfo: {
        avatar: '', // 头像信息
        continued: null, // 连续起床的天数
        getupTime: null, // 起床时间
        rank: null, // 我的排名
        uid: null, // 我的用户ID
        userName: null, // 我的用户名
      },
      // 个人列表【默认值】赋默认值是必须的过程
      myList: {
        list: [],
        hasMore: true, // 这个默认值要特殊设置一下
        offset: 0, // 如果要加载数据 我应该从第几条数据开始加载
        limit: 10, // 这次加载数据我打算加载多少条 一般这个值不变的
        loading: true, // 列表是否在加载
      }
    };
  }

  clickHandler () {

  }

  // 获取我的个人列表 参数 返回值
  getMyList = (offset, limit) => {
    // 发送请求之前 设置loading
    this.setState({
      myList: {
        ...this.state.myList,
        ...{loading: true}
      }
    });

    // 发送请求中
    ajax({
      url: 'http://localhost:8333/api/mylist',
      method: 'post',
      data: {
        offset: this.state.myList.offset, // 自己去拿
        limit: this.state.myList.limit, // 自己去拿
      }
    }).then((res) => {
      // 发送请求后[成功]
      let { hasMore, list } = res;

      // 构造请求之后的列表
      let newList = [
        // 第一次的时候myList.list是数组
        ...this.state.myList.list,
        ...list
      ];

      // 请求成功后设置state
      this.setState({
        myList: {
          ...this.state.myList,
          list: newList, // BE
          hasMore: res.hasMore, // BE
          loading: false,
          offset: newList.length,
        }
      });
    }).catch((err) => {
      // 发送请求后[失败]
      // 告知用户
      this.setState({
        myList: {
          ...this.state.myList,
          loading: false
        }
      });
    });
  };

  componentDidMount () {
    // 请求我的信息
    ajax({
      url: 'http://localhost:8333/api/myinfo',
      method: 'GET',
    }).then((res) => {
      this.setState({
        userInfo: res
      });
      // 调用设置个人信息的action
      this.props.setMyInfo(res);
    }).catch((err) => {
      console.log(err);
    });

    // 第一次获取个人信息列表
    this.getMyList();

    // [ok] hasMore flag 标识 当我们已经加载完成的时候 即使滚动到底部了 也不去加载
    // [ok] ajax 方法公用
    // [ok]发送请求的时候不允许在请求数据 loading 状态不能再发送数据 在正在加载中的状态的时候不能再去请求数据了
    // 组件卸载的时候 记得 removeEventListener scroll
    // 没有数据了给用户一个提示
    // offsetHeight 会引发重绘重排相关的事情，通过节流结局
    // 滚动到底部这个东西可以单独做成一个组件 提供给所有的list使用
    // 上拉刷新
    // 列表的空状态 怎么告诉告诉
    // 返回顶部
    // 图片的延迟加载
    this.refs.mainPage.addEventListener('scroll', this.mainPageScrollHandler, false)
  }

  // 绑定到mainPage上的滚动监听回调函数
  mainPageScrollHandler = (e) => {
    let scrollHeight = this.refs.mainPage.scrollHeight;
    let offsetHeight = this.refs.mainPage.offsetHeight;
    let scrollTop = this.refs.mainPage.scrollTop;

    // 如果是loading状态不让再去请求
    if (this.state.myList.loading ||
      this.state.myList.hasMore === false
    ) {
      return void 0;
    }

    if ( scrollHeight === offsetHeight+scrollTop ) {
      this.getMyList(); // 发送请求 该函数内 会自动去state获取offset和limit 不用手动传
    }
  };


  // 组件卸载的时候要做的事情
  componentWillUnmount ()  {
    // 万一把scroll绑定到了document上呢 思考下是不是必须要卸载
    // 绑定到mainPage当前情况下是不需要卸载的 也可以
    this.refs.mainPage.removeEventListener('scroll', this.mainPageScrollHandler)
  }


  render () {
    // let { userName, avatar } = this.state.userInfo;
    let { userName, avatar } = this.props.myInfo;
    let { list, hasMore,
      offset, limit, loading
    } = this.state.myList;

    return (
      <div className="page-wrap main-page" ref="mainPage">
        <div className="my-avatar">
          <img src={avatar}/>
        </div>
        <p className="my-name">{userName}</p>
        {/* 我的列表 */}
        <div className="card-list-wrap">
          <div className="card-list">
            {
              list.map((item, index) => {
                let {img, isLike, like, status, text, time, uid, userName} = item;

                return (
                  <div key={index} className="card-item">
                    <div className="img-wrap">
                      <img src={img}/>
                    </div>
                    <div className="content-wrap">
                      <div className="card-text">{text}</div>
                      <div className="card-time">{time}</div>
                    </div>
                  </div>
                )
              })
            }
          </div>
          {loading ? <p className="card-status">正在加载中</p> : null}
          {hasMore === false ? <p className="card-status">没有数据数据啦🤡🤡🤡</p> : null}
        </div>
      </div>
    )
  }
}
import './index.less';
