/**
 * Created by zlzsam on 2017/4/8.
 */

(function($, com, win, appFutureImpl) {
	/******************************请求Api常量区******************************/
	//var HOST_NAME = "http://36.110.36.118:8095";
	var HOST_NAME = "https://demo.proudsmart.com";
	//var HOST_NAME = "http://180.76.147.159"
	var PORT = "";
	var ROUTE = "/api/rest/post";
	var REQUEST_API = HOST_NAME + PORT + ROUTE;

	//登录接口
	//var LOGIN_API = REQUEST_API + "/userLoginUIService/login";
	var LOGIN_API = REQUEST_API + "/userLoginUIService/loginApp";
	//获取警告信息接口
	var GET_ALERT_BY_PAGE_API = REQUEST_API + "/alertQueryFlexService/getAlertByPage";
	//获取设备信息接口
	var GET_DEVICES_BY_CONDITION_WITHPAGE = REQUEST_API + "/resourceUIService/getDevicesByConditionWithPage";
	//获取所有设备
	var GET_DEVICES_ALL_API = REQUEST_API + "/resourceUIService/getDevicesByCondition";
	//获取客户信息接口
	var GET_CUSTOMER_INFO_API = REQUEST_API + "/customerUIService/findCustomersByCondition";
	//根据id获取客户信息接口
	var GET_CUSTOMER_INFO_BY_ID_API = REQUEST_API + "/customerUIService/findCustomersById";
	//关闭警告接口
	var ALERT_SEND_RECOVER_ACTION_API = REQUEST_API + "/alertManageFlexService/sendRecoverAction";
	//警告确认接口
	var ALERT_SEND_CLAIM_ACTION_API = REQUEST_API + "/alertManageFlexService/sendClaimAction";
	//启用设备接口
	var DEVICE_ACTIVATE_GATEWAY_API = REQUEST_API + "/resourceUIService/activateDevice";
	//停用设备接口
	var DEVICE_DEACTIVATE_GATEWAY_API = REQUEST_API + "/resourceUIService/deactivateDevice";
	//查找project接口
	var FIND_PROJECTS_API = REQUEST_API + "/projectUIService/findProjectsByCondition";
	//查找工单
	var TASK_FIND_TICKETS_API = REQUEST_API + "/ticketTaskService/findTickets";
	//获得KQI/
	var GET_KPI_VALUE_LIST = REQUEST_API + "/kpiDataFlexService/getKpiValueList";
	//获得设备的模板
	var GET_MODEL = REQUEST_API + "/resourceUIService/getModelByIds";
	//获得设备的模板的KPI定义
	var GET_MODEL_KPIS = REQUEST_API + "/resourceUIService/getKpisByModelId";
	//获得设备的模板的属性定义
	var GET_MODEL_ATTRS = REQUEST_API + "/resourceUIService/getAttrsByModelId";
	//获得系统配置
	var GET_CONFIG = REQUEST_API + "/configUIService/getConfigsByGroupName";
	//获得系统单位
	var GET_UNIT = REQUEST_API + "/unitService/getAllUnits";
	//获取资源域
	var GET_DOMAINS = REQUEST_API + "/resourceUIService/getDomainsByFilter";
	//获取查看后消息
	var GET_READ_MESSAGE_API = REQUEST_API + "/psMessageService/modifyMsgStatus";
	//获取最新的消息
	var GET_LEAST_MESSAGE_API = REQUEST_API + "/psMessageService/queryMessageByStatusAndUserID";
	//全部的消息接口
	var GET_ALL_MESSAGE_LIST_API = REQUEST_API + "/psMessageService/queryMessageByUserID";
	//获取工单流程定义
	var GET_TICKET_CATEGORYS_API = REQUEST_API + "/ticketCategoryService/getTicketCategorys";
	//按状态获取工单信息
	var GET_TICKETS_BYSTATUS_API = REQUEST_API + "/ticketTaskService/getTicketsByStatus";
	//工单查询
	var GET_TICKET_API = REQUEST_API + "/ticketTaskService/getTicket";
	//按工单号获取工单执行历史
	var GET_TICKET_LOG_BY_TICKETNO_API = REQUEST_API + "/ticketLogService/getByTicketNo";
	//获取企业下所有用户
	var GET_ENTERPRISE_API = REQUEST_API + "/userEnterpriseService/queryEnterpriseRole";
	//获取所有的工单流程
	var GET_TICKET_API = REQUEST_API + "/ticketCategoryService/getTicketCategorys"
	//转工单
	var SEND_TICKET_API = REQUEST_API + "/alertManageFlexService/sendForwardAction";
	//发起工单
	var COMMIT_TICKET_API = REQUEST_API + "/ticketTaskService/commitTicket";
	//取消工单
	var CANCEL_TICKET_API = REQUEST_API + "/ticketTaskService/cancelTicket";
	//工单流程往下走
	var TICKET_STATUS_API = REQUEST_API + "/ticketTaskService/getTicketTasksByStatus";
	//工单执行
	var TICKET_ACTION_API = REQUEST_API + "/workflowService/getWorkflowById";
	//获取完成执行
	var TICKET_ACTION_ALL_API = REQUEST_API + "/ticketTaskService/getTicketTaskById";
	//获取user
	var GET_ALL_USER_API = REQUEST_API + "/userUIService/queryUserByCondition";
	var DO_ACTION_API = REQUEST_API + "/ticketTaskService/doTask";
	//注销账户时候清除cid
	var LOGIN_OUT_API = REQUEST_API +  "/userLoginUIService/logout";
	//版本检查更新
	var REFRESH_VERSION_API = REQUEST_API + "/configUIService/getAppInfo";
	//根据id获取设备信息
	var GET_DEVICE_SOURCE_API = REQUEST_API + "/resourceUIService/getResourceById";
	//根据id获取指令
	var GET_DEVICE_DIRECTIVES_API = REQUEST_API + "/resourceUIService/getDirectivesByModelId";
	//发送指令
	var SEND_DEVICE_DIRECTIVES_API = REQUEST_API + "/resourceUIService/sendDeviceDirective";
	/******************************请求方法******************************/

	/**
	 * 用户登录
	 * @param username
	 * @param password
	 */
	appFutureImpl.login = function (username, password, cid,futureListener) {
	//appFutureImpl.login = function(username, password, futureListener) {
		var params = [username, password,cid];
		//var params = [username, password];
		com.buildNetworkPostFuture(LOGIN_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				storageUtil.setUserInfo(result.data);
				/* 登陆后清空模版相关的缓存 */
				var allInfo = storageUtil.getAllInfo();
				if(allInfo) {
					allInfo.modelDic = {};
					storageUtil.setAllInfo(allInfo);
				}
				storageUtil.setAllDevicesInfoList(null)
				futureListener(result.data, null);
			}
		});
	}
			/**
		 * 注销账户时候清除cid
		 * @param futureListener
		 */
		appFutureImpl.loginout = function(futureListener) {
			com.buildNetworkPostFuture(LOGIN_OUT_API, [],function(result, success, msg) {
					if(null != msg) {
						futureListener(null, msg);
						return;
					}
					if(success && result.code == 0) {
						futureListener(result.data, null);
					}
			})
		}
	/**
	 * 获取企业的所有角色
	 * @param futureListener
	 */
	appFutureImpl.getInfo = function(futureListener) {
		com.buildNetworkPostFuture(GET_ENTERPRISE_API, [], function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}

		})
	}
	/**
	 * 获取查看后消息
	 * @param futureListener
	 */
	appFutureImpl.getReadMessage = function(messageId, futureListener) {
		//测试用全部消息接口GET_ALL_MESSAGE_LIST_API param:[]
		var params = [messageId];
		com.buildNetworkPostFuture(GET_READ_MESSAGE_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}
	/**
	 * 获取最新消息
	 * @param futureListener
	 */
	appFutureImpl.getLeastMessage = function(futureListener) {
		//测试用全部消息接口GET_ALL_MESSAGE_LIST_API param:[]
		com.buildNetworkPostFuture(GET_LEAST_MESSAGE_API, 0, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}

	/**
	 * 获取全部消息
	 * @param futureListener
	 */
	appFutureImpl.getAllMessage = function(futureListener) {
		com.buildNetworkPostFuture(GET_ALL_MESSAGE_LIST_API, [], function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}
	/**
   * 设备信息
   * @param futureListener
   */
  appFutureImpl.getResourceById = function(params, futureListener) {
    com.buildNetworkPostFuture(GET_DEVICE_SOURCE_API, params, function(result, success, msg) {
      if(null != msg) {
        futureListener(null, msg);
        return;
      }
      if(success && result.code == 0) {
        futureListener(result.data, null);
      }
    })
  }
  	/**
   * 获取所有指令
   * @param futureListener
   */
  appFutureImpl.getDirectivesListById = function(params, futureListener) {
    com.buildNetworkPostFuture(GET_DEVICE_DIRECTIVES_API, params, function(result, success, msg) {
      if(null != msg) {
        futureListener(null, msg);
        return;
      }
      if(success && result.code == 0) {
        futureListener(result.data, null);
      }
    })
  }
  	/**
   * 发送指令
   * @param futureListener
   */
  appFutureImpl.sendDirectivesList = function(params, futureListener) {
    com.buildNetworkPostFuture(SEND_DEVICE_DIRECTIVES_API, params, function(result, success, msg) {
      if(null != msg) {
        futureListener(null, msg);
        return;
      }
      if(success && result.code == 0) {
        futureListener(result.data, null);
      }
    })
  }
  

	/**
	 * 查找工单
	 * @param futureListener
	 */
	appFutureImpl.findTicketsByCondition = function(params, futureListener) {
		com.buildNetworkPostFuture(TASK_FIND_TICKETS_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}
	/**
	 * 工单流程继续
	 * @param futureListener
	 */
	appFutureImpl.getTicketTasksByStatus = function(params, futureListener) {
		com.buildNetworkPostFuture(TICKET_STATUS_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}
	/**
	 * 工单执行
	 * @param futureListener
	 */
	appFutureImpl.getWorkflowById = function(params, futureListener) {
		com.buildNetworkPostFuture(TICKET_ACTION_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}
	/**
	 * 工单执行列表数据
	 * @param futureListener
	 */
	appFutureImpl.getTicketTaskById = function(params, futureListener) {
		com.buildNetworkPostFuture(TICKET_ACTION_ALL_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}
	/**
	 * 获取所有用户角色
	 * @param futureListener
	 */
	appFutureImpl.queryUserByCondition = function(params, futureListener) {
		com.buildNetworkPostFuture(GET_ALL_USER_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}

	/**
	 * 获取项目信息
	 * @param futureListener
	 */
	appFutureImpl.findProjectsByCondition = function(customerId, futureListener) {
		var params = {
			customerId: customerId
		};
		com.buildNetworkPostFuture(FIND_PROJECTS_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}

	/**
	 * 启用该设备
	 * @param deviceId
	 * @param futureListener
	 */
	appFutureImpl.deviceActivateGateway = function(deviceId, futureListener) {
		var params = [deviceId];
		com.buildNetworkPostFuture(DEVICE_ACTIVATE_GATEWAY_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}

	/**
	 * 停用该设备
	 * @param deviceId
	 * @param futureListener
	 */
	appFutureImpl.deviceDeactivateGateway = function(deviceId, futureListener) {
		var params = [deviceId];
		com.buildNetworkPostFuture(DEVICE_DEACTIVATE_GATEWAY_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}

	/**
	 * 关闭警告接口
	 * @param params
	 * @param futureListener
	 */
	appFutureImpl.sendAlertRecoverAction = function(params, futureListener) {
		com.buildNetworkPostFuture(ALERT_SEND_RECOVER_ACTION_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}

	/**
	 * 确认警告接口
	 * @param params
	 * @param futureListener
	 */
	appFutureImpl.sendAlertClaimAction = function(params, futureListener) {
		com.buildNetworkPostFuture(ALERT_SEND_CLAIM_ACTION_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}

	/**
	 * 获取所有的客户信息
	 * @param futureListener
	 */
	appFutureImpl.getAllCustomerInfoList = function(futureListener) {
		var params = {
			"orCondition": "",
			"customerName": "",
			"customerAddress": "",
			"domainPath": "",
			"customerPhone": ""
		};
		com.buildNetworkPostFuture(GET_CUSTOMER_INFO_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				storageUtil.setAllCustomersInfoList(result.data);
				futureListener(result.data, null);
			}
		});
	}

	/**
	 * 通过id来获取客户的信息
	 * @param futureListener
	 */
	appFutureImpl.getCustomerById = function(customerId, futureListener) {
		var params = [customerId];
		com.buildNetworkPostFuture(GET_CUSTOMER_INFO_BY_ID_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		});
	}

	/**
	 * 获取设备信息(分页)
	 * @param args 例如:{ "start": 0, "length": 10, "sort": "createTime", "sortType": "desc", "statCount": true }
	 * @param futureListener
	 */
	appFutureImpl.getDevicesByConditionWithPage = function(params, futureListener) {
		com.buildNetworkPostFuture(GET_DEVICES_BY_CONDITION_WITHPAGE, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, 0, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data.data, result.data.total, null);
			}
		});
	}
	appFutureImpl.getDevicesAllByCondition = function(params, futureListener) {
		com.buildNetworkPostFuture(GET_DEVICES_ALL_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, 0, msg);
				return;
			}
			if(success && result.code == 0) {
				//console.log("所有设备" + JSON.stringify(result))
				//futureListener(result.data.data, result.data.total, null);
				futureListener(result.data, null, null);
			}
		});
	}

	/**
	 * 获取所有的设备信息
	 * @param domainPath
	 * @param futureListener
	 */
	appFutureImpl.getAllDevicesByCondition = function(domainPath, futureListener) {
		var param1 = {
			"domainPath": domainPath
		};
		var param2 = {
			"start": 0,
			"sort": "createTime",
			"sortType": "desc",
			"statCount": true
		};
		var param = [param1, param2];
		com.buildNetworkPostFuture(GET_DEVICES_BY_CONDITION_WITHPAGE, param, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, 0, msg);
				return;
			}
			if(success && result.code == 0) {
				storageUtil.setAllDevicesInfoList(result.data.data);
				futureListener(result.data.data, result.data.total, null);
			}
		});
	}

	/**
	 * 获取不同级别的警告数据
	 * @param severities 1:警告;2:次要;3:重要;4:严重;
	 * @url /api/rest/post/alertQueryFlexService/getAlertByPage
	 * @desc TODO
	 */
	appFutureImpl.getAlertByPage = function(params1, params2, futureListener) {
		var params = [params1, params2];
		com.buildNetworkPostFuture(GET_ALERT_BY_PAGE_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, 0, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data.data, result.data.total, null);
			}
		});
	}

	/**
	 * 获取系统各级别KPI/KQI数据
	 * @param kpiQueryModel:{"category":"ci","isRealTimeData":true,"nodeIds":[186793350166066],"kpiCodes":[3022],"startTime":null,"endTime":null,"timeRange":"","statisticType":"psiot","includeInstance":true,"condList":[]}
	 * @url /api/rest/post/kpiDataFlexService/getKpiValueList
	 * @desc TODO
	 */
	appFutureImpl.getKpiValueList = function(kpiQueryModel, futureListener) {
		var params = ["kpi", kpiQueryModel];
		com.buildNetworkPostFuture(GET_KPI_VALUE_LIST, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		});
	}

	/**
	 * 根据配置组名获得配置信息
	 * @param {Object} params
	 * @param {Object} futureListener
	 */
	appFutureImpl.getConfigsByGroupName = function(params, futureListener) {
		com.buildNetworkPostFuture(GET_CONFIG, [params], function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		});
	}

	/**
	 * 通过模型IDS列表获取模型
	 * @param {Object} params
	 * @param {Object} futureListener
	 */
	appFutureImpl.getModelByIds = function(params, futureListener) {
		com.buildNetworkPostFuture(GET_MODEL, [params], function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data);
			}
		});
	}

	/**
	 * 通过模型ID列表获取模型KPIS
	 * @param {Object} params
	 * @param {Object} futureListener
	 */
	appFutureImpl.getKpisByModelId = function(params, futureListener) {
		com.buildNetworkPostFuture(GET_MODEL_KPIS, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data);
			}
		});
	}
	/**
	 * 通过模型ID列表获取模型属性定义
	 * @param {Object} params
	 * @param {Object} futureListener
	 */
	appFutureImpl.getAttrsByModelId = function(params, futureListener) {
		com.buildNetworkPostFuture(GET_MODEL_ATTRS, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data);
			}
		});
	}

	/**
	 * 获得系统内单位的定义
	 * @param {Object} futureListener
	 */
	appFutureImpl.getAllUnits = function(futureListener) {
		var allInfo = storageUtil.getAllInfo();
		if(allInfo && allInfo.unitDics && allInfo.unitDics.Amount) {
			futureListener(allInfo.unitDics);
			return;
		}
		com.buildNetworkPostFuture(GET_UNIT, [], function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {

				if(!allInfo) allInfo = {};
				if(!allInfo.unitDics) allInfo.unitDics = {};

				for(var i = 0; i < result.data.length; i++) {
					allInfo.unitDics[result.data[i].unitCode] = result.data[i].unitName;
					if(result.data[i].unitCode == "NA" || result.data[i].unitCode == "Number")
						allInfo.unitDics[result.data[i].unitCode] = "";
				}
				storageUtil.setAllInfo(allInfo);
				futureListener(allInfo.unitDics);
			}
		});
	}

	/**
	 * 获取工单流程定义
	 * @param {Object} futureListener
	 */
	appFutureImpl.getTicketCategorys = function(futureListener) {
		com.buildNetworkPostFuture(GET_TICKET_CATEGORYS_API, [], function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data);
			}
		});
	}

	/**
	 * 获取工单执行历史
	 * @param {Object} futureListener
	 */
	appFutureImpl.getTicketLog = function(ticketNo, futureListener) {
		com.buildNetworkPostFuture(GET_TICKET_LOG_BY_TICKETNO_API, ticketNo, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data);
			}
		});
	}

	//获取所有工单流程
	appFutureImpl.getTicket = function(futureListener) {
		com.buildNetworkPostFuture(GET_TICKET_API, [], function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}

		})
	}
	/**
	 * 录入检修实绩
	 * @param futureListener
	 */
	appFutureImpl.doTask = function(params, futureListener) {
		com.buildNetworkPostFuture(DO_ACTION_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}

	//转工单 
	appFutureImpl.sendTicket = function(alertInfo, ticket, futureListener) {
		var params = [alertInfo, ticket];
		com.buildNetworkPostFuture(SEND_TICKET_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}
	//发起工单
	appFutureImpl.commitTicket = function(params, futureListener) {
		com.buildNetworkPostFuture(COMMIT_TICKET_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}
		/*
		*版本检查更新
		 *
		 * */
	appFutureImpl.getAppInfo = function(futureListener) {
			com.buildNetworkPostFuture(REFRESH_VERSION_API, [],function(result, success, msg) {
					if(null != msg) {
						futureListener(null, msg);
						return;
					}
					if(success && result.code == 0) {
						futureListener(result.data, null);
					}
			})
		}
	//取消工单
	appFutureImpl.cancelTicket = function(params, futureListener) {
		com.buildNetworkPostFuture(CANCEL_TICKET_API, params, function(result, success, msg) {
			if(null != msg) {
				futureListener(null, msg);
				return;
			}
			if(success && result.code == 0) {
				futureListener(result.data, null);
			}
		})
	}

	appFutureImpl.getHost = function() {
		return HOST_NAME + PORT;
	}

})(mui, common, window, window.appFutureImpl = {})