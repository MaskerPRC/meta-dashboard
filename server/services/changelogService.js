/**
 * 项目改动日志服务
 * 负责记录和查询项目的改动历史
 */

const db = require('../config/database');

class ChangelogService {
  /**
   * 记录项目改动
   * @param {Object} change - 改动信息
   * @param {number} change.project_id - 项目ID
   * @param {number} change.user_id - 用户ID
   * @param {string} change.change_type - 改动类型
   * @param {string} change.field_name - 字段名
   * @param {any} change.old_value - 旧值
   * @param {any} change.new_value - 新值
   * @param {string} change.description - 描述
   * @param {string} change.ip_address - IP地址
   * @param {string} change.user_agent - 用户代理
   */
  static async recordChange(change) {
    return new Promise((resolve, reject) => {
      const {
        project_id,
        user_id,
        change_type,
        field_name = null,
        old_value = null,
        new_value = null,
        description,
        ip_address = null,
        user_agent = null
      } = change;

      const sql = `
        INSERT INTO project_changelog (
          project_id, user_id, change_type, field_name, 
          old_value, new_value, description, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const oldValueStr = old_value ? JSON.stringify(old_value) : null;
      const newValueStr = new_value ? JSON.stringify(new_value) : null;

      db.run(sql, [
        project_id,
        user_id,
        change_type,
        field_name,
        oldValueStr,
        newValueStr,
        description,
        ip_address,
        user_agent
      ], function(err) {
        if (err) {
          console.error('记录项目改动失败:', err);
          reject(err);
        } else {
          console.log(`✓ 记录项目改动成功: ${change_type} - ${description}`);
          resolve({ id: this.lastID });
        }
      });
    });
  }

  /**
   * 获取项目改动历史
   * @param {number} projectId - 项目ID
   * @param {Object} options - 查询选项
   */
  static async getProjectChangelog(projectId, options = {}) {
    return new Promise((resolve, reject) => {
      const { page = 1, limit = 20, changeType = null } = options;
      const offset = (page - 1) * limit;

      let sql = `
        SELECT 
          pc.id,
          pc.project_id,
          pc.change_type,
          pc.field_name,
          pc.old_value,
          pc.new_value,
          pc.description,
          pc.ip_address,
          pc.created_at,
          u.id as user_id,
          u.username,
          u.display_name,
          u.avatar_url
        FROM project_changelog pc
        LEFT JOIN users u ON pc.user_id = u.id
        WHERE pc.project_id = ?
      `;

      const params = [projectId];

      if (changeType) {
        sql += ' AND pc.change_type = ?';
        params.push(changeType);
      }

      sql += ' ORDER BY pc.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('获取项目改动历史失败:', err);
          reject(err);
        } else {
          // 解析JSON字段
          const changelog = rows.map(row => ({
            ...row,
            old_value: row.old_value ? JSON.parse(row.old_value) : null,
            new_value: row.new_value ? JSON.parse(row.new_value) : null,
            user: row.user_id ? {
              id: row.user_id,
              username: row.username,
              display_name: row.display_name,
              avatar_url: row.avatar_url
            } : null
          }));

          // 获取总数
          const countSql = `
            SELECT COUNT(*) as total 
            FROM project_changelog 
            WHERE project_id = ?
            ${changeType ? 'AND change_type = ?' : ''}
          `;
          const countParams = changeType ? [projectId, changeType] : [projectId];

          db.get(countSql, countParams, (countErr, countResult) => {
            if (countErr) {
              console.error('获取改动历史总数失败:', countErr);
              reject(countErr);
            } else {
              resolve({
                changelog,
                pagination: {
                  page: parseInt(page),
                  limit: parseInt(limit),
                  total: countResult.total,
                  pages: Math.ceil(countResult.total / limit)
                }
              });
            }
          });
        }
      });
    });
  }

  /**
   * 获取全局改动历史
   * @param {Object} options - 查询选项
   */
  static async getGlobalChangelog(options = {}) {
    return new Promise((resolve, reject) => {
      const { page = 1, limit = 50, changeType = null, projectId = null } = options;
      const offset = (page - 1) * limit;

      let sql = `
        SELECT 
          pc.id,
          pc.project_id,
          pc.change_type,
          pc.field_name,
          pc.old_value,
          pc.new_value,
          pc.description,
          pc.ip_address,
          pc.created_at,
          u.id as user_id,
          u.username,
          u.display_name,
          u.avatar_url,
          p.title as project_title
        FROM project_changelog pc
        LEFT JOIN users u ON pc.user_id = u.id
        LEFT JOIN projects p ON pc.project_id = p.id
        WHERE 1=1
      `;

      const params = [];

      if (changeType) {
        sql += ' AND pc.change_type = ?';
        params.push(changeType);
      }

      if (projectId) {
        sql += ' AND pc.project_id = ?';
        params.push(projectId);
      }

      sql += ' ORDER BY pc.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('获取全局改动历史失败:', err);
          reject(err);
        } else {
          // 解析JSON字段
          const changelog = rows.map(row => ({
            ...row,
            old_value: row.old_value ? JSON.parse(row.old_value) : null,
            new_value: row.new_value ? JSON.parse(row.new_value) : null,
            user: row.user_id ? {
              id: row.user_id,
              username: row.username,
              display_name: row.display_name,
              avatar_url: row.avatar_url
            } : null,
            project: {
              id: row.project_id,
              title: row.project_title
            }
          }));

          // 获取总数
          let countSql = 'SELECT COUNT(*) as total FROM project_changelog WHERE 1=1';
          const countParams = [];

          if (changeType) {
            countSql += ' AND change_type = ?';
            countParams.push(changeType);
          }

          if (projectId) {
            countSql += ' AND project_id = ?';
            countParams.push(projectId);
          }

          db.get(countSql, countParams, (countErr, countResult) => {
            if (countErr) {
              console.error('获取全局改动历史总数失败:', countErr);
              reject(countErr);
            } else {
              resolve({
                changelog,
                pagination: {
                  page: parseInt(page),
                  limit: parseInt(limit),
                  total: countResult.total,
                  pages: Math.ceil(countResult.total / limit)
                }
              });
            }
          });
        }
      });
    });
  }

  /**
   * 比较对象差异并生成改动记录
   * @param {Object} oldObj - 旧对象
   * @param {Object} newObj - 新对象
   * @param {Array} fieldsToTrack - 要跟踪的字段
   */
  static generateChanges(oldObj, newObj, fieldsToTrack) {
    const changes = [];

    fieldsToTrack.forEach(field => {
      const oldValue = oldObj[field];
      const newValue = newObj[field];

      // 简单值比较
      if (oldValue !== newValue) {
        changes.push({
          field_name: field,
          old_value: oldValue,
          new_value: newValue,
          description: this.generateFieldDescription(field, oldValue, newValue)
        });
      }
    });

    return changes;
  }

  /**
   * 生成字段修改描述
   * @param {string} field - 字段名
   * @param {any} oldValue - 旧值
   * @param {any} newValue - 新值
   */
  static generateFieldDescription(field, oldValue, newValue) {
    const fieldNames = {
      title: '项目标题',
      description: '项目描述',
      status: '项目状态',
      priority: '优先级',
      progress: '进度',
      tech_stack: '技术栈',
      github_repo: 'GitHub仓库',
      demo_url: '演示地址',
      tags: '标签',
      content: '项目内容',
      order_index: '排序'
    };

    const fieldName = fieldNames[field] || field;
    
    if (oldValue === null || oldValue === undefined) {
      return `设置${fieldName}为：${newValue}`;
    } else if (newValue === null || newValue === undefined) {
      return `清空${fieldName}`;
    } else {
      return `修改${fieldName}：${oldValue} → ${newValue}`;
    }
  }

  /**
   * 获取客户端IP地址
   * @param {Object} req - 请求对象
   */
  static getClientIP(req) {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
  }
}

module.exports = ChangelogService;
