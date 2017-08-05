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
        hasMore: false,
        offset: 0, // 如果要加载数据 我应该从第几条数据开始加载
        limit: 10, // 这次加载数据我打算加载多少条 一般这个值不变的
        loading: true, // 列表是否在加载
      }
    };
  }

  clickHandler () {

  }

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

    // 获取我的个人列表
    ajax({
      url: 'http://localhost:8333/api/mylist',
      method: 'post',
      data: {
        offset: 0,
        limit: 10,
      }
    }).then((res) => {
      console.log(res);
      let { hasMore, list } = res;
      this.setState({
        myList: {
          ...this.state.myList,
          list, res, loading: false,
          offset: list.length,
        }
      });
    }).catch((err) => {
      this.setState({
        myList: {
          ...this.state.myList,
          loading: false
        }
      });
      console.log(err);
    });

    // hasMore flag 标识
    // ajax 方法公用
    // 发送请求的时候不允许在请求数据 loading 状态不能再发送数据
    // 组件卸载的时候 记得 removeEventListener scroll
    // 没有数据了给用户一个提示
    // offsetHeight 会引发重绘重排相关的事情，通过节流结局
    // 滚动到底部这个东西可以单独做成一个组件 提供给所有的list使用
    // 上拉刷新
    // 列表的空状态 怎么告诉告诉
    // 返回顶部
    // 图片的延迟加载
    this.refs.mainPage.addEventListener('scroll', (e) => {
      let scrollHeight = this.refs.mainPage.scrollHeight;
      let offsetHeight = this.refs.mainPage.offsetHeight;
      let scrollTop = this.refs.mainPage.scrollTop;

      if ( scrollHeight === offsetHeight+scrollTop ) {
        // 滚动到底部再去发送请求
        let {offset,limit} = this.state.myList;
        ajax({
          url: 'http://localhost:8333/api/mylist',
          method: 'post',
          data: {
            offset: offset,
            limit: limit,
          }
        }).then((res) => {
          let { hasMore, list } = res;
          // 新的列表数据 = 当前的列表数据 + 这次返回的列表数据
          let newList = [...this.state.myList.list, ...list];
          this.setState({
            myList: {
              ...this.state.myList,
              hasMore,
              list: newList,
              loading: false,
              offset: newList.length
            }
          });
        }).catch((err) => {
          this.setState({
            myList: {
              ...this.state.myList,
              loading: false
            }
          });
          console.log(err);
        });
      }
    }, false)
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
        </div>
      </div>
    )
  }
}
import './index.less';
