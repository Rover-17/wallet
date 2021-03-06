/*
  Copyright 2017~2022 The Bottos Authors
  This file is part of the Bottos Data Exchange Client
  Created by Developers Team of Bottos.

  This program is free software: you can distribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with Bottos. If not, see <http://www.gnu.org/licenses/>.
*/
import React, { Component, PureComponent } from 'react';
import { deleteFile, updateFile } from '@/redux/actions/uploaderAction'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import { Icon, Popconfirm } from 'antd'
import { FormattedMessage } from 'react-intl'
import messages from '@/locales/messages'
const PersonalAssetMessages = messages.PersonalAsset
import uploader from '../uploader'

function BeforeIcon({percent, status}) {
  if (percent == 100 || status == 'done') {
    return <Icon type="check" />
  } else if (status == 'uploading') {
    return <Icon type="loading" />;
  } else if (status == 'error') {
    return <Icon type="exclamation-circle-o" />
  }
}

class UploadingFile extends PureComponent {
  constructor(props) {
    super(props);
    this.deleteFileFormList = this.deleteFileFormList.bind(this)
    this.handlePlayOrPause = this.handlePlayOrPause.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  deleteFileFormList() {
    const { deleteFile, id } = this.props
    deleteFile(id)
    if (uploader.getFiles().some(file => file.id == id)) {
      uploader.removeFile(id)
    }
  }

  handlePlayOrPause(e) {
    const { id, status, updateFile } = this.props
    if (status == 'uploading') {
      uploader.stop(id)
      updateFile({...this.props, status: 'interrupt'})
    } else if (status == 'error') {
      // let file = uploader.getFiles().find(file => file.id == id)
      // if (!file) {
      //
      // }
      // uploader.retry(file)
    } else if (status == 'interrupt') {
      uploader.upload(id)
      updateFile({...this.props, status: 'uploading'})
    }
  }

  handleClose(e) {
    const { deleteFile, id, status, percent } = this.props
    console.log('status', status);
    if (status == 'done' || status == 'error' || percent == 100) {
      deleteFile(id)
      e.stopPropagation()
    }
  }

  render() {
    const { name, status, percent } = this.props
    const __percent = (percent || 0) - 100 + '%'
    return <div className='file-upload-item' style={{'--percent': __percent}}>
      <div></div>
      <span>
        {BeforeIcon({status, percent})}
      </span>
      <div className='file-upload-item-name'>{name}</div>
      <div className='file-upload-functional-icons'>
        {/* <Popconfirm
          title={<FormattedMessage {...PersonalAssetMessages.SureToDelete} />}
          onConfirm={this.deleteFileFormList}
          placement="topRight"
          > */}
          <span className='file-upload-item-pause' onClick={this.handlePlayOrPause}>
            {
              status != 'done' && (
                status == 'uploading' ? <Icon type="pause" /> : <Icon type="play-circle-o" />
              )
            }
          </span>
          <span className='file-upload-item-close' onClick={this.handleClose}>
            <Icon type="close" />
          </span>
          {/* </Popconfirm> */}
      </div>
    </div>
  }
}

UploadingFile.propTypes = {
  status: PropTypes.oneOf(['uploading', 'done', 'error', 'interrupt']),
};

UploadingFile.defaultProps = {
  percent: 0
};

class ProgressList extends Component {

  render() {

    const { fileList, progressMap, deleteFile, updateFile } = this.props

    const list = fileList.map((file) => {
      return <UploadingFile
        key={file.guid || file.id}
        {...file}
        percent={progressMap[file.guid]}
        deleteFile={deleteFile}
        updateFile={updateFile}
      />;
    })

    return (
      <div className='file-upload-list'>{list}</div>
    );
  }

}

function mapStateToProps(state) {
  const { fileList, progressMap } = state.uploaderState
  return { fileList, progressMap };
}

function mapDispatchToProps(dispatch) {
  return {
    deleteFile(f) {
      dispatch( deleteFile(f) )
    },
    updateFile(file) {
      dispatch( updateFile(file) )
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgressList);
