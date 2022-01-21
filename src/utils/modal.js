import React from 'react';
import { View, Text, Button } from '@tarojs/components'
import {fspc, isN} from '../utils/fn'


class Modal extends React.Component {
    constructor(props) {
        super(props);

        let {isOpened} = props
        
        this.handleCancel = (event) => {
          if (typeof this.props.onCancel === 'function') {
            this.props.onCancel(event);
          }
        };
        this.handleConfirm = (event) => {
          if (typeof this.props.onConfirm === 'function') {
            this.props.onConfirm(event);
          }
        };
        this.handlePhone = (event) => {
          if (typeof this.props.onPhone === 'function') {
            this.props.onPhone(event);
          }
        };
        this.state = {
          isOpened: isOpened
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      const { isOpened } = nextProps;
      if (isOpened !== this.state.isOpened) {
        this.setState({ isOpened: isOpened });
      }
    }
    
    render() {
      const { isOpened } = this.state;
      const { title, content, cancelText, confirmText, phoneText } = this.props;
     

      return (
        <View className={(isOpened)?"g-modal act":"g-modal"}>
          <View className="m-wrap">
            <View className="m-title">{title}</View>
            <View className="m-content">{content}</View>

            <View className="m-fun">
              {(!isN(cancelText))&&
              <View className="m-btn" onClick={this.handleCancel}>
                   {cancelText}
              </View>}

              {(!isN(confirmText))&&
              <View className="m-btn" onClick={this.handleConfirm}>
                 {confirmText}
              </View>}

              {(!isN(phoneText))&&
              <Button className="m-btn" openType="getPhoneNumber" onGetPhoneNumber={this.handlePhone}>
                   {phoneText}
              </Button>}
            </View>
            
          </View>
            
        </View>
      )
        
    }
}

export default Modal
