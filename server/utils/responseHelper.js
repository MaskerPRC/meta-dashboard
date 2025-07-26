/**
 * 响应助手工具 - 提供国际化的API响应
 */

class ResponseHelper {
  
  /**
   * 成功响应
   * @param {Object} res - Express响应对象
   * @param {Object} req - Express请求对象
   * @param {string} messageKey - 翻译键
   * @param {Object} data - 响应数据
   * @param {number} status - HTTP状态码
   */
  static success(res, req, messageKey, data = {}, status = 200) {
    return res.status(status).json({
      success: true,
      message: req.t(messageKey),
      data,
      ...data
    });
  }

  /**
   * 错误响应
   * @param {Object} res - Express响应对象
   * @param {Object} req - Express请求对象
   * @param {string} messageKey - 翻译键
   * @param {number} status - HTTP状态码
   * @param {Object} extra - 额外数据
   */
  static error(res, req, messageKey, status = 400, extra = {}) {
    return res.status(status).json({
      success: false,
      message: req.t(messageKey),
      ...extra
    });
  }

  /**
   * 验证错误响应
   * @param {Object} res - Express响应对象
   * @param {Object} req - Express请求对象
   * @param {string} messageKey - 翻译键
   */
  static validationError(res, req, messageKey) {
    return this.error(res, req, messageKey, 400);
  }

  /**
   * 认证错误响应
   * @param {Object} res - Express响应对象
   * @param {Object} req - Express请求对象
   * @param {string} messageKey - 翻译键
   */
  static authError(res, req, messageKey) {
    return this.error(res, req, messageKey, 401);
  }

  /**
   * 权限错误响应
   * @param {Object} res - Express响应对象
   * @param {Object} req - Express请求对象
   * @param {string} messageKey - 翻译键
   */
  static forbiddenError(res, req, messageKey) {
    return this.error(res, req, messageKey, 403);
  }

  /**
   * 未找到错误响应
   * @param {Object} res - Express响应对象
   * @param {Object} req - Express请求对象
   * @param {string} messageKey - 翻译键
   */
  static notFoundError(res, req, messageKey) {
    return this.error(res, req, messageKey, 404);
  }

  /**
   * 服务器错误响应
   * @param {Object} res - Express响应对象
   * @param {Object} req - Express请求对象
   * @param {string} messageKey - 翻译键
   * @param {Object} extra - 额外数据
   */
  static serverError(res, req, messageKey, extra = {}) {
    return this.error(res, req, messageKey, 500, extra);
  }
}

module.exports = ResponseHelper; 