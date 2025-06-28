// =====================================
// Think标签验证和修复工具
// =====================================

class ThinkTagVerifier {
    constructor() {
        this.pendingContent = new Map(); // 存储待处理的内容
        this.verificationCallbacks = new Map(); // 存储验证回调
    }

    /**
     * 验证并修复think标签内容
     * @param {string} content - 需要验证的内容
     * @param {string} messageId - 消息ID
     * @param {HTMLElement} contentElement - 内容元素
     * @param {Function} aiSearchEngine - AI搜索引擎实例
     */
    verifyAndFixThinkTags(content, messageId, contentElement, aiSearchEngine) {
        console.group('🚀 Think标签验证开始');
        console.log('消息ID:', messageId);
        console.log('原始内容长度:', content.length);
        console.log('是否包含think标签:', content.includes('<think>'));
        console.log('contentElement:', contentElement);
        console.log('aiSearchEngine存在:', !!aiSearchEngine);
        console.log('aiSearchEngine.processThinkTags存在:', !!(aiSearchEngine && typeof aiSearchEngine.processThinkTags === 'function'));
        console.log('aiSearchEngine.bindThinkEventListeners存在:', !!(aiSearchEngine && typeof aiSearchEngine.bindThinkEventListeners === 'function'));
        
        // 显示原始内容的前200个字符
        console.log('内容预览:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));

        // 检查think标签的完整性
        const thinkTagStats = this.analyzeThinkTags(content);
        console.log('Think标签分析结果:', thinkTagStats);

        let result;

        // 如果没有think标签，只进行Markdown渲染
        if (thinkTagStats.openCount === 0) {
            console.log('未发现think标签，进行Markdown渲染后返回');
            if (aiSearchEngine && typeof aiSearchEngine.renderMarkdown === 'function') {
                console.log('🎨 使用aiSearchEngine进行Markdown渲染...');
                result = aiSearchEngine.renderMarkdown(content);
                console.log('✓ Markdown渲染完成，内容长度:', result.length);
            } else if (typeof marked !== 'undefined') {
                console.log('🎨 使用marked.js进行Markdown渲染...');
                try {
                    result = marked.parse(content);
                    console.log('✓ marked.js渲染完成，内容长度:', result.length);
                } catch (error) {
                    console.warn('marked.js渲染失败:', error);
                    result = content;
                }
            } else {
                console.log('⚠️ 无可用的Markdown渲染器，返回原内容');
                result = content;
            }
        }
        // 如果think标签完整，正常处理
        else if (thinkTagStats.isComplete) {
            console.log('Think标签完整，进行正常处理');
            result = this.processCompleteThinkTags(content, aiSearchEngine);
        }
        // 如果think标签不完整，进行修复
        else {
            console.log('检测到不完整的think标签，开始修复...');
            result = this.fixIncompleteThinkTags(content, messageId, contentElement, aiSearchEngine);
        }
        
        console.log('验证处理结果长度:', result.length);
        console.log('结果是否包含think-container:', result.includes('think-container'));
        console.groupEnd();
        
        return result;
    }

    /**
     * 分析think标签的状态
     * @param {string} content - 内容
     * @returns {Object} 分析结果
     */
    analyzeThinkTags(content) {
        const openTags = content.match(/<think>/g) || [];
        const closeTags = content.match(/<\/think>/g) || [];
        
        const openCount = openTags.length;
        const closeCount = closeTags.length;
        const isComplete = openCount === closeCount && openCount > 0;
        
        // 检查每个think标签是否完整
        const thinkPairs = [];
        let tempContent = content;
        let searchPos = 0;
        
        while (true) {
            const openIndex = tempContent.indexOf('<think>', searchPos);
            if (openIndex === -1) break;
            
            const closeIndex = tempContent.indexOf('</think>', openIndex);
            if (closeIndex === -1) {
                // 找到未闭合的标签
                thinkPairs.push({
                    openIndex: openIndex,
                    closeIndex: -1,
                    complete: false,
                    content: tempContent.substring(openIndex + 7) // 7 是 '<think>' 的长度
                });
                break;
            } else {
                // 找到完整的标签对
                thinkPairs.push({
                    openIndex: openIndex,
                    closeIndex: closeIndex,
                    complete: true,
                    content: tempContent.substring(openIndex + 7, closeIndex)
                });
                searchPos = closeIndex + 8; // 8 是 '</think>' 的长度
            }
        }

        return {
            openCount,
            closeCount,
            isComplete,
            thinkPairs,
            hasIncomplete: thinkPairs.some(pair => !pair.complete)
        };
    }

    /**
     * 处理完整的think标签
     * @param {string} content - 内容
     * @param {Object} aiSearchEngine - AI搜索引擎实例
     * @returns {string} 处理后的内容
     */
    processCompleteThinkTags(content, aiSearchEngine) {
        console.log('处理完整的think标签...');
        console.log('输入内容:', content);
        
        let processedContent;
        
        // 首先确保内容经过markdown渲染
        if (aiSearchEngine && typeof aiSearchEngine.renderMarkdown === 'function') {
            console.log('🎨 首先进行Markdown渲染...');
            processedContent = aiSearchEngine.renderMarkdown(content);
            console.log('✓ Markdown渲染完成，内容长度:', processedContent.length);
        } else if (typeof marked !== 'undefined') {
            console.log('🎨 使用marked.js进行Markdown渲染...');
            try {
                processedContent = marked.parse(content);
                console.log('✓ marked.js渲染完成，内容长度:', processedContent.length);
            } catch (error) {
                console.warn('marked.js渲染失败:', error);
                processedContent = content;
            }
        } else {
            console.log('⚠️ 无可用的Markdown渲染器，直接使用原内容');
            processedContent = content;
        }
        
        // 如果Markdown渲染已经包含think标签处理，直接返回
        if (processedContent.includes('think-container')) {
            console.log('✓ Markdown渲染已处理think标签，无需额外处理');
        } else {
            // 否则手动处理think标签（针对特殊情况）
            if (aiSearchEngine && typeof aiSearchEngine.processThinkTags === 'function') {
                console.log('🔄 手动处理think标签...');
                processedContent = aiSearchEngine.processThinkTags(processedContent);
                console.log('✓ Think标签处理完成');
            } else {
                console.log('⚠️ aiSearchEngine.processThinkTags不可用，使用备用方案');
                processedContent = this.fallbackProcessThinkTags(processedContent, false, aiSearchEngine);
            }
        }
        
        // 详细输出处理结果
        console.group('📋 完整Think标签处理结果');
        console.log('原始内容:', content);
        console.log('处理后内容:', processedContent);
        console.log('是否包含think-container:', processedContent.includes('think-container'));
        console.log('是否包含think-header:', processedContent.includes('think-header'));
        console.log('是否包含data-think-id:', processedContent.includes('data-think-id'));
        console.log('是否包含<p>标签:', processedContent.includes('<p>'));
        console.log('是否包含<h>标签:', processedContent.includes('<h'));
        console.log('是否包含<strong>标签:', processedContent.includes('<strong>'));
        
        // 使用正则表达式分析生成的think容器
        const thinkContainerMatches = processedContent.match(/<div class="think-container[^"]*">/g);
        console.log('找到的think-container数量:', thinkContainerMatches ? thinkContainerMatches.length : 0);
        
        if (thinkContainerMatches) {
            thinkContainerMatches.forEach((match, index) => {
                console.log(`Think容器 ${index + 1} HTML:`, match);
            });
        }
        
        // 如果这是直接调用的完整处理（非延迟验证），立即绑定事件
        if (aiSearchEngine && typeof aiSearchEngine.bindThinkEventListeners === 'function') {
            console.log('🔗 准备立即绑定think事件监听器...');
            
            // 创建临时DOM来测试事件绑定
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = processedContent;
            
            const tempThinkHeaders = tempDiv.querySelectorAll('.think-header[data-think-id]');
            console.log('临时DOM中找到的think头部数量:', tempThinkHeaders.length);
            
            tempThinkHeaders.forEach((header, index) => {
                const thinkId = header.getAttribute('data-think-id');
                console.log(`临时头部${index + 1} ID:`, thinkId);
                
                // 检查对应的content元素是否存在
                const correspondingContent = tempDiv.querySelector(`#${thinkId}`);
                console.log(`临时头部${index + 1}对应的内容元素存在:`, !!correspondingContent);
            });
        }
        
        console.groupEnd();
        
        return processedContent;
    }

    /**
     * 修复不完整的think标签
     * @param {string} content - 内容
     * @param {string} messageId - 消息ID
     * @param {HTMLElement} contentElement - 内容元素
     * @param {Object} aiSearchEngine - AI搜索引擎实例
     * @returns {string} 修复后的内容
     */
    fixIncompleteThinkTags(content, messageId, contentElement, aiSearchEngine) {
        console.log('开始修复不完整的think标签...');

        // 存储待处理的内容
        this.pendingContent.set(messageId, {
            content: content,
            contentElement: contentElement,
            aiSearchEngine: aiSearchEngine,
            timestamp: Date.now()
        });

        // 设置延迟验证，等待可能的后续内容
        this.scheduleDelayedVerification(messageId);

        // 临时显示当前可处理的内容
        return this.generateTemporaryDisplay(content, aiSearchEngine);
    }

    /**
     * 安排延迟验证
     * @param {string} messageId - 消息ID
     */
    scheduleDelayedVerification(messageId) {
        // 清除之前的定时器
        if (this.verificationCallbacks.has(messageId)) {
            clearTimeout(this.verificationCallbacks.get(messageId));
        }

        // 设置新的定时器
        const timeoutId = setTimeout(() => {
            this.performDelayedVerification(messageId);
        }, 2000); // 2秒后进行最终验证

        this.verificationCallbacks.set(messageId, timeoutId);
        console.log('已安排延迟验证，消息ID:', messageId);
    }

    /**
     * 执行延迟验证
     * @param {string} messageId - 消息ID
     */
    performDelayedVerification(messageId) {
        console.log('执行延迟验证，消息ID:', messageId);

        const pending = this.pendingContent.get(messageId);
        if (!pending) {
            console.log('未找到待处理内容，验证已取消');
            return;
        }

        const { content, contentElement, aiSearchEngine } = pending;

        // 重新分析think标签
        const thinkTagStats = this.analyzeThinkTags(content);
        console.log('延迟验证 - Think标签分析结果:', thinkTagStats);

        let finalContent;
        if (thinkTagStats.isComplete) {
            // 现在完整了，正常处理
            finalContent = this.processCompleteThinkTags(content, aiSearchEngine);
            console.log('延迟验证完成 - think标签已完整');
        } else {
            // 仍然不完整，使用备用方案
            finalContent = this.handlePersistentIncomplete(content, aiSearchEngine);
            console.log('延迟验证完成 - think标签仍不完整，使用备用方案');
        }

        // 更新DOM
        if (contentElement) {
            contentElement.innerHTML = finalContent;
            
            // 重新初始化代码高亮
            if (typeof hljs !== 'undefined') {
                contentElement.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }

            // 绑定think容器的事件监听器
            if (finalContent.includes('think-container') && aiSearchEngine) {
                console.log('准备绑定think容器事件监听器...');
                
                // 先等待DOM更新完成
                setTimeout(() => {
                    console.group('🎯 Think容器事件绑定详细过程');
                    
                    // 检查aiSearchEngine的方法
                    console.log('aiSearchEngine.bindThinkEventListeners存在:', typeof aiSearchEngine.bindThinkEventListeners === 'function');
                    console.log('aiSearchEngine.toggleThinkContent存在:', typeof aiSearchEngine.toggleThinkContent === 'function');
                    
                    // 查找think容器
                    const thinkContainers = contentElement.querySelectorAll('.think-container');
                    const thinkHeaders = contentElement.querySelectorAll('.think-header[data-think-id]');
                    
                    console.log('找到think容器数量:', thinkContainers.length);
                    console.log('找到think头部数量:', thinkHeaders.length);
                    
                    // 手动绑定事件（备用方案）
                    thinkHeaders.forEach((header, index) => {
                        const thinkId = header.getAttribute('data-think-id');
                        console.log(`处理第${index + 1}个think头部，ID:`, thinkId);
                        
                        // 移除旧的事件监听器
                        header.onclick = null;
                        
                        // 检查是否已经有事件监听器
                        const hasExistingListener = header.hasAttribute('data-listener-bound');
                        console.log(`头部${index + 1}是否已绑定事件:`, hasExistingListener);
                        
                        if (!hasExistingListener) {
                            // 添加新的事件监听器
                            const clickHandler = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                console.log('🖱️ Think头部被点击，ID:', thinkId);
                                
                                // 手动执行折叠逻辑
                                const thinkContent = document.getElementById(thinkId);
                                const toggleIcon = document.getElementById(`toggle-${thinkId}`);
                                
                                console.log('找到think内容元素:', !!thinkContent);
                                console.log('找到toggle图标元素:', !!toggleIcon);
                                
                                if (thinkContent && toggleIcon) {
                                    if (thinkContent.classList.contains('collapsed')) {
                                        console.log('展开think内容');
                                        thinkContent.classList.remove('collapsed');
                                        thinkContent.classList.add('expanded');
                                        toggleIcon.classList.remove('fa-chevron-down');
                                        toggleIcon.classList.add('fa-chevron-up');
                                    } else {
                                        console.log('折叠think内容');
                                        thinkContent.classList.remove('expanded');
                                        thinkContent.classList.add('collapsed');
                                        toggleIcon.classList.remove('fa-chevron-up');
                                        toggleIcon.classList.add('fa-chevron-down');
                                    }
                                } else {
                                    console.error('⚠️ 未找到think内容或toggle图标元素');
                                }
                                
                                // 如果aiSearchEngine的方法存在，也调用一下
                                if (aiSearchEngine && typeof aiSearchEngine.toggleThinkContent === 'function') {
                                    console.log('同时调用aiSearchEngine.toggleThinkContent');
                                    aiSearchEngine.toggleThinkContent(thinkId);
                                }
                            };
                            
                            header.addEventListener('click', clickHandler);
                            header.setAttribute('data-listener-bound', 'true');
                            
                            console.log(`✓ 已为头部${index + 1}绑定点击事件`);
                            
                            // 测试点击事件
                            console.log(`测试头部${index + 1}的点击响应...`);
                            header.style.cursor = 'pointer';
                            header.style.userSelect = 'none';
                        }
                    });
                    
                    // 尝试调用原始的bindThinkEventListeners
                    if (typeof aiSearchEngine.bindThinkEventListeners === 'function') {
                        console.log('调用aiSearchEngine.bindThinkEventListeners...');
                        try {
                            aiSearchEngine.bindThinkEventListeners(contentElement);
                            console.log('✓ aiSearchEngine.bindThinkEventListeners调用成功');
                        } catch (error) {
                            console.error('✗ aiSearchEngine.bindThinkEventListeners调用失败:', error);
                        }
                    }
                    
                    console.groupEnd();
                }, 100); // 延迟100ms确保DOM更新完成
                
                console.log('✓ Think容器事件监听器绑定流程已启动');
            }
            
            // 详细的调试输出
            console.group('🔍 Think标签处理完整调试信息');
            console.log('消息ID:', messageId);
            console.log('原始内容:', content);
            console.log('最终渲染内容:', finalContent);
            console.log('DOM元素:', contentElement);
            console.log('是否包含think-container:', finalContent.includes('think-container'));
            
            // 检查DOM中的think容器
            const thinkContainers = contentElement.querySelectorAll('.think-container');
            console.log('找到的think容器数量:', thinkContainers.length);
            
            thinkContainers.forEach((container, index) => {
                const header = container.querySelector('.think-header');
                const content = container.querySelector('.think-content');
                const thinkId = header ? header.getAttribute('data-think-id') : null;
                
                console.log(`Think容器 ${index + 1}:`, {
                    container: container,
                    header: header,
                    content: content,
                    thinkId: thinkId,
                    hasClickEvent: header ? (header.onclick !== null || header.getAttribute('data-think-id') !== null) : false
                });
            });
            
            // 测试点击功能
            if (thinkContainers.length > 0 && aiSearchEngine && typeof aiSearchEngine.toggleThinkContent === 'function') {
                console.log('测试think容器点击功能...');
                const firstContainer = thinkContainers[0];
                const firstHeader = firstContainer.querySelector('.think-header');
                if (firstHeader) {
                    const testThinkId = firstHeader.getAttribute('data-think-id');
                    if (testThinkId) {
                        console.log('测试think ID:', testThinkId);
                        // 不实际触发，只是测试函数是否存在
                        console.log('toggleThinkContent函数存在:', typeof aiSearchEngine.toggleThinkContent === 'function');
                      }
                    }
                  }
            
            console.groupEnd();
        }

        // 清理
        this.pendingContent.delete(messageId);
        this.verificationCallbacks.delete(messageId);
    }

    /**
     * 生成临时显示内容
     * @param {string} content - 原始内容
     * @param {Object} aiSearchEngine - AI搜索引擎实例（可选）
     * @returns {string} 临时显示的HTML
     */
    generateTemporaryDisplay(content, aiSearchEngine = null) {
        console.log('生成临时显示内容...');

        // 找到完整的think标签并处理它们
        let processedContent = content;
        const completeThinkRegex = /<think>([\s\S]*?)<\/think>/g;
        const completeMatches = Array.from(content.matchAll(completeThinkRegex));

        if (completeMatches.length > 0) {
            console.log('发现', completeMatches.length, '个完整的think标签，进行处理');
            processedContent = this.fallbackProcessThinkTags(content, true, aiSearchEngine);
        }

        // 处理不完整的think标签
        const incompleteThinkRegex = /<think>(?![\s\S]*?<\/think>)([\s\S]*)$/;
        const incompleteMatch = processedContent.match(incompleteThinkRegex);

        if (incompleteMatch) {
            console.log('发现不完整的think标签，添加临时提示');
            const beforeIncomplete = processedContent.substring(0, incompleteMatch.index);
            const incompleteContent = incompleteMatch[1];
            
            // 生成临时的think容器
            const thinkId = 'temp-think-' + Date.now();
            const tempThinkContainer = `
                <div class="think-container temp-think">
                    <div class="think-header" style="opacity: 0.7;">
                        <i class="fas fa-brain think-icon"></i>
                        <span class="think-label">AI正在思考中...</span>
                        <i class="fas fa-spinner fa-spin think-toggle-icon"></i>
                    </div>
                    <div class="think-content collapsed" id="${thinkId}">
                        <div class="think-inner">
                            <div class="thinking-placeholder">
                                <i class="fas fa-ellipsis-h"></i>
                                <span>思考过程正在生成...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            processedContent = beforeIncomplete + tempThinkContainer;
        }

        return processedContent;
    }

    /**
     * 处理持续不完整的think标签
     * @param {string} content - 内容
     * @param {Object} aiSearchEngine - AI搜索引擎实例
     * @returns {string} 处理后的内容
     */
    handlePersistentIncomplete(content, aiSearchEngine) {
        console.log('处理持续不完整的think标签...');

        // 先处理完整的think标签
        let processedContent = content;
        const completeThinkRegex = /<think>([\s\S]*?)<\/think>/g;
        processedContent = processedContent.replace(completeThinkRegex, (match, thinkContent) => {
            return this.createThinkContainer(thinkContent, false, aiSearchEngine);
        });

        // 处理不完整的think标签 - 自动补全
        const incompleteThinkRegex = /<think>(?![\s\S]*?<\/think>)([\s\S]*)$/;
        const incompleteMatch = processedContent.match(incompleteThinkRegex);

        if (incompleteMatch) {
            console.log('自动补全不完整的think标签');
            const beforeIncomplete = processedContent.substring(0, incompleteMatch.index);
            const incompleteContent = incompleteMatch[1];
            
            // 自动补全think标签并处理
            const completedThinkContainer = this.createThinkContainer(incompleteContent, true, aiSearchEngine);
            processedContent = beforeIncomplete + completedThinkContainer;
        }

        return processedContent;
    }

    /**
     * 创建think容器
     * @param {string} content - think内容
     * @param {boolean} isAutoCompleted - 是否为自动补全
     * @returns {string} think容器HTML
     */
    createThinkContainer(content, isAutoCompleted = false, aiSearchEngine = null) {
        const thinkId = 'think-' + Math.random().toString(36).substr(2, 9);
        const label = isAutoCompleted ? 'AI思考过程 (自动补全)' : 'AI思考过程';
        const extraClass = isAutoCompleted ? ' auto-completed' : '';
        
        // 确保think内容经过Markdown渲染
        let renderedContent = content.trim();
        
        // 如果内容不包含HTML标签，则可能需要Markdown渲染
        const hasHTMLTags = /<[a-z][\s\S]*>/i.test(renderedContent);
        
        if (!hasHTMLTags) {
            console.log('Think内容可能需要Markdown渲染，内容长度:', renderedContent.length);
            
            if (aiSearchEngine && typeof aiSearchEngine.renderMarkdown === 'function') {
                console.log('🎨 对think内容进行Markdown渲染...');
                renderedContent = aiSearchEngine.renderMarkdown(renderedContent);
                console.log('✓ Think内容Markdown渲染完成');
            } else if (typeof marked !== 'undefined') {
                console.log('🎨 使用marked.js对think内容进行渲染...');
                try {
                    renderedContent = marked.parse(renderedContent);
                    console.log('✓ Think内容marked.js渲染完成');
                } catch (error) {
                    console.warn('Think内容marked.js渲染失败:', error);
                }
            } else {
                console.log('⚠️ 无可用的Markdown渲染器，think内容保持原样');
            }
        } else {
            console.log('Think内容已包含HTML标签，跳过Markdown渲染');
        }
        
        const containerHTML = `
            <div class="think-container${extraClass}">
                <div class="think-header" data-think-id="${thinkId}">
                    <i class="fas fa-brain think-icon"></i>
                    <span class="think-label">${label}</span>
                    <i class="fas fa-chevron-down think-toggle-icon" id="toggle-${thinkId}"></i>
                </div>
                <div class="think-content collapsed" id="${thinkId}">
                    <div class="think-inner">
                        ${renderedContent}
                    </div>
                </div>
            </div>
        `;
        
        console.log('创建think容器:', {
            thinkId: thinkId,
            label: label,
            isAutoCompleted: isAutoCompleted,
            originalContentLength: content.length,
            renderedContentLength: renderedContent.length,
            hasHTMLTags: hasHTMLTags,
            containerHTMLLength: containerHTML.length
        });
        
        return containerHTML;
    }

    /**
     * 备用think标签处理方案
     * @param {string} content - 内容
     * @param {boolean} onlyComplete - 只处理完整的标签
     * @param {Object} aiSearchEngine - AI搜索引擎实例（可选）
     * @returns {string} 处理后的内容
     */
    fallbackProcessThinkTags(content, onlyComplete = false, aiSearchEngine = null) {
        console.log('使用备用think标签处理方案...');

        const regex = onlyComplete ? 
            /<think>([\s\S]*?)<\/think>/g : 
            /<think>([\s\S]*?)(?:<\/think>|$)/g;

        return content.replace(regex, (match, thinkContent) => {
            const isComplete = match.endsWith('</think>');
            return this.createThinkContainer(thinkContent, !isComplete, aiSearchEngine);
        });
    }

    /**
     * 清理过期的待处理内容
     */
    cleanupExpiredContent() {
        const now = Date.now();
        const expireTime = 5 * 60 * 1000; // 5分钟过期

        for (const [messageId, data] of this.pendingContent.entries()) {
            if (now - data.timestamp > expireTime) {
                console.log('清理过期的待处理内容，消息ID:', messageId);
                
                // 清理定时器
                if (this.verificationCallbacks.has(messageId)) {
                    clearTimeout(this.verificationCallbacks.get(messageId));
                    this.verificationCallbacks.delete(messageId);
                }
                
                // 清理待处理内容
                this.pendingContent.delete(messageId);
            }
        }
    }

    /**
     * 更新消息内容（用于流式更新）
     * @param {string} messageId - 消息ID
     * @param {string} newContent - 新内容
     */
    updateContent(messageId, newContent) {
        if (this.pendingContent.has(messageId)) {
            const pending = this.pendingContent.get(messageId);
            pending.content = newContent;
            pending.timestamp = Date.now(); // 更新时间戳
            
            console.log('更新待处理内容，消息ID:', messageId, '新长度:', newContent.length);
            
            // 重新安排验证
            this.scheduleDelayedVerification(messageId);
        }
    }
}

// 创建全局实例
window.thinkTagVerifier = new ThinkTagVerifier();

// 定期清理过期内容
setInterval(() => {
    window.thinkTagVerifier.cleanupExpiredContent();
}, 60000); // 每分钟清理一次

// 扩展AISearchEngine类以使用验证器
if (typeof AISearchEngine !== 'undefined') {
    console.log('✓ AISearchEngine已找到，开始扩展功能...');
    
    // 重写updateStreamMessage方法
    const originalUpdateStreamMessage = AISearchEngine.prototype.updateStreamMessage;
    AISearchEngine.prototype.updateStreamMessage = async function(contentElement, fullContent) {
        console.log('📡 流式消息更新 - 内容长度:', fullContent.length);
        
        // 调用原始方法（不处理think标签）
        await originalUpdateStreamMessage.call(this, contentElement, fullContent);
        
        // 获取消息ID
        const messageElement = contentElement.closest('.message');
        const messageId = messageElement ? messageElement.dataset.messageId || Date.now().toString() : Date.now().toString();
        
        // 如果没有设置messageId，设置一个
        if (messageElement && !messageElement.dataset.messageId) {
            messageElement.dataset.messageId = messageId;
        }
        
        console.log('📡 流式更新消息ID:', messageId);
        
        // 使用验证器更新内容
        window.thinkTagVerifier.updateContent(messageId, fullContent);
    };

    // 重写流式处理完成后的方法
    const originalHandleStreamComplete = AISearchEngine.prototype.handleStreamingResponse;
    if (originalHandleStreamComplete) {
        console.log('✓ 找到handleStreamingResponse方法，进行扩展');
        AISearchEngine.prototype.handleStreamingResponse = async function(...args) {
            console.log('🏁 流式处理完成，开始最终验证...');
            
            const result = await originalHandleStreamComplete.apply(this, args);
            
            // 获取最后一条消息并进行验证
            const lastMessage = this.messagesContainer.querySelector('.message:last-child');
            if (lastMessage) {
                const contentElement = lastMessage.querySelector('.message-content');
                const messageId = lastMessage.dataset.messageId || Date.now().toString();
                
                if (!lastMessage.dataset.messageId) {
                    lastMessage.dataset.messageId = messageId;
                }
                
                console.log('🏁 最终验证消息ID:', messageId);
                console.log('🏁 消息元素存在:', !!lastMessage);
                console.log('🏁 内容元素存在:', !!contentElement);
                
                // 使用验证器进行最终验证
                const fullContent = lastMessage.dataset.fullContent || contentElement.textContent;
                if (fullContent) {
                    console.log('🏁 开始最终think标签验证，内容长度:', fullContent.length);
                    
                    const verifiedContent = window.thinkTagVerifier.verifyAndFixThinkTags(
                        fullContent, messageId, contentElement, this
                    );
                    
                    if (verifiedContent !== contentElement.innerHTML) {
                        console.log('🏁 内容已更新，重新设置DOM');
                        contentElement.innerHTML = verifiedContent;
                        
                        // 重新绑定事件
                        if (verifiedContent.includes('think-container')) {
                            console.log('🏁 重新绑定think容器事件');
                            this.bindThinkEventListeners(contentElement);
                        }
                    } else {
                        console.log('🏁 内容无变化，跳过DOM更新');
                    }
                } else {
                    console.log('⚠️ 未找到fullContent');
                }
            } else {
                console.log('⚠️ 未找到最后一条消息');
            }
            
            return result;
        };
    } else {
        console.log('⚠️ 未找到handleStreamingResponse方法');
    }
} else {
    console.log('⚠️ AISearchEngine未找到，跳过扩展');
}

console.log('🔧 Think标签验证器已加载并配置完成');

// 添加全局测试函数，用于手动测试think标签处理
window.testThinkTags = function() {
    console.group('🧪 手动测试Think标签处理');
    
    const testContent = `
这是一个测试内容：

<think>
这是一个完整的think标签内容
包含了详细的思考过程：
1. 分析问题
2. 思考解决方案
3. 得出结论
</think>

这是think标签之后的内容。
    `;
    
    console.log('测试内容:', testContent);
    
    // 创建临时DOM元素
    const testDiv = document.createElement('div');
    testDiv.innerHTML = '<div class="message-content"></div>';
    document.body.appendChild(testDiv);
    
    const contentElement = testDiv.querySelector('.message-content');
    const messageId = 'test-' + Date.now();
    
    // 模拟AISearchEngine
    const mockAIEngine = {
        processThinkTags: function(html) {
            console.log('mockAIEngine.processThinkTags被调用');
            return html.replace(/<think>([\s\S]*?)<\/think>/g, (match, content) => {
                const thinkId = 'mock-think-' + Math.random().toString(36).substr(2, 9);
                return `
                    <div class="think-container">
                        <div class="think-header" data-think-id="${thinkId}">
                            <i class="fas fa-brain think-icon"></i>
                            <span class="think-label">AI思考过程</span>
                            <i class="fas fa-chevron-down think-toggle-icon" id="toggle-${thinkId}"></i>
                        </div>
                        <div class="think-content collapsed" id="${thinkId}">
                            <div class="think-inner">
                                ${content.trim()}
                            </div>
                        </div>
                    </div>
                `;
            });
        },
        bindThinkEventListeners: function(element) {
            console.log('mockAIEngine.bindThinkEventListeners被调用');
            const headers = element.querySelectorAll('.think-header[data-think-id]');
            console.log('mock引擎找到的头部数量:', headers.length);
            
            headers.forEach((header, index) => {
                const thinkId = header.getAttribute('data-think-id');
                console.log(`为mock头部${index + 1}绑定事件，ID:`, thinkId);
                
                header.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🖱️ Mock Think header clicked! ID:', thinkId);
                    
                    // 手动实现toggle逻辑
                    const thinkContent = document.getElementById(thinkId);
                    const toggleIcon = document.getElementById(`toggle-${thinkId}`);
                    
                    if (thinkContent && toggleIcon) {
                        if (thinkContent.classList.contains('collapsed')) {
                            thinkContent.classList.remove('collapsed');
                            thinkContent.classList.add('expanded');
                            toggleIcon.classList.remove('fa-chevron-down');
                            toggleIcon.classList.add('fa-chevron-up');
                            console.log('Mock引擎：展开think内容');
                        } else {
                            thinkContent.classList.remove('expanded');
                            thinkContent.classList.add('collapsed');
                            toggleIcon.classList.remove('fa-chevron-up');
                            toggleIcon.classList.add('fa-chevron-down');
                            console.log('Mock引擎：折叠think内容');
                        }
                    }
                });
                
                // 设置样式
                header.style.cursor = 'pointer';
                header.style.userSelect = 'none';
            });
        },
        toggleThinkContent: function(thinkId) {
            console.log('mockAIEngine.toggleThinkContent被调用，ID:', thinkId);
            const thinkContent = document.getElementById(thinkId);
            const toggleIcon = document.getElementById(`toggle-${thinkId}`);
            
            if (thinkContent && toggleIcon) {
                if (thinkContent.classList.contains('collapsed')) {
                    thinkContent.classList.remove('collapsed');
                    thinkContent.classList.add('expanded');
                    toggleIcon.classList.remove('fa-chevron-down');
                    toggleIcon.classList.add('fa-chevron-up');
                } else {
                    thinkContent.classList.remove('expanded');
                    thinkContent.classList.add('collapsed');
                    toggleIcon.classList.remove('fa-chevron-up');
                    toggleIcon.classList.add('fa-chevron-down');
                }
            }
        }
    };
    
    // 使用验证器处理内容
    const result = window.thinkTagVerifier.verifyAndFixThinkTags(
        testContent, messageId, contentElement, mockAIEngine
    );
    
    console.log('处理结果:', result);
    contentElement.innerHTML = result;
    
    // 检查DOM结果
    const thinkContainers = contentElement.querySelectorAll('.think-container');
    console.log('生成的think容器数量:', thinkContainers.length);
    
    thinkContainers.forEach((container, index) => {
        console.log(`容器 ${index + 1}:`, container.outerHTML);
    });
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(testDiv);
        console.log('测试完成，DOM已清理');
    }, 5000);
    
    console.groupEnd();
    
    return {
        result: result,
        contentElement: contentElement,
        thinkContainers: thinkContainers
    };
};

console.log('🧪 测试函数已添加，可以在控制台运行 testThinkTags() 进行手动测试');

// 添加专门的点击诊断函数
window.diagnoseThinkClick = function() {
    console.group('🔧 Think点击问题诊断');
    
    // 查找所有think容器
    const allThinkContainers = document.querySelectorAll('.think-container');
    const allThinkHeaders = document.querySelectorAll('.think-header[data-think-id]');
    
    console.log('页面中找到的think容器总数:', allThinkContainers.length);
    console.log('页面中找到的think头部总数:', allThinkHeaders.length);
    
    allThinkHeaders.forEach((header, index) => {
        const thinkId = header.getAttribute('data-think-id');
        const correspondingContent = document.getElementById(thinkId);
        const toggleIcon = document.getElementById(`toggle-${thinkId}`);
        
        console.group(`诊断Think头部 ${index + 1}`);
        console.log('Think ID:', thinkId);
        console.log('头部元素:', header);
        console.log('对应内容元素存在:', !!correspondingContent);
        console.log('Toggle图标元素存在:', !!toggleIcon);
        console.log('头部当前样式cursor:', getComputedStyle(header).cursor);
        console.log('头部是否有data-listener-bound:', header.hasAttribute('data-listener-bound'));
        console.log('头部onclick属性:', header.onclick);
        
        // 检查CSS样式
        if (correspondingContent) {
            const contentStyle = getComputedStyle(correspondingContent);
            console.log('内容元素classes:', correspondingContent.classList.toString());
            console.log('内容元素当前display:', contentStyle.display);
            console.log('内容元素当前maxHeight:', contentStyle.maxHeight);
            console.log('内容元素当前opacity:', contentStyle.opacity);
            console.log('内容元素当前overflow:', contentStyle.overflow);
            console.log('内容元素当前transition:', contentStyle.transition);
            console.log('内容元素当前padding:', contentStyle.padding);
            console.log('内容元素当前margin:', contentStyle.margin);
            
            // 测试切换状态
            console.log('🧪 测试状态切换...');
            const wasCollapsed = correspondingContent.classList.contains('collapsed');
            
            if (wasCollapsed) {
                correspondingContent.classList.remove('collapsed');
                correspondingContent.classList.add('expanded');
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-chevron-down');
                    toggleIcon.classList.add('fa-chevron-up');
                }
                console.log('切换到展开状态');
            } else {
                correspondingContent.classList.remove('expanded');
                correspondingContent.classList.add('collapsed');
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-chevron-up');
                    toggleIcon.classList.add('fa-chevron-down');
                }
                console.log('切换到折叠状态');
            }
            
            // 等待动画完成后检查结果
            setTimeout(() => {
                const newStyle = getComputedStyle(correspondingContent);
                console.log('切换后的样式:');
                console.log('- maxHeight:', newStyle.maxHeight);
                console.log('- opacity:', newStyle.opacity);
                console.log('- padding:', newStyle.padding);
                
                // 恢复原状态
                if (wasCollapsed) {
                    correspondingContent.classList.remove('expanded');
                    correspondingContent.classList.add('collapsed');
                    if (toggleIcon) {
                        toggleIcon.classList.remove('fa-chevron-up');
                        toggleIcon.classList.add('fa-chevron-down');
                    }
                } else {
                    correspondingContent.classList.remove('collapsed');
                    correspondingContent.classList.add('expanded');
                    if (toggleIcon) {
                        toggleIcon.classList.remove('fa-chevron-down');
                        toggleIcon.classList.add('fa-chevron-up');
                    }
                }
            }, 500);
        }
        
        console.groupEnd();
    });
    
    // 检查CSS样式是否加载
    console.log('检查CSS样式加载情况...');
    const testDiv = document.createElement('div');
    testDiv.className = 'think-content collapsed';
    testDiv.innerHTML = '<div class="think-inner">测试内容</div>';
    document.body.appendChild(testDiv);
    
    const computedStyle = getComputedStyle(testDiv);
    console.log('collapsed状态的样式:');
    console.log('- maxHeight:', computedStyle.maxHeight);
    console.log('- opacity:', computedStyle.opacity);
    console.log('- padding:', computedStyle.padding);
    console.log('- overflow:', computedStyle.overflow);
    console.log('- transition:', computedStyle.transition);
    
    // 测试展开样式
    testDiv.classList.remove('collapsed');
    testDiv.classList.add('expanded');
    
    setTimeout(() => {
        const expandedStyle = getComputedStyle(testDiv);
        console.log('expanded状态的样式:');
        console.log('- maxHeight:', expandedStyle.maxHeight);
        console.log('- opacity:', expandedStyle.opacity);
        console.log('- padding:', expandedStyle.padding);
        
        document.body.removeChild(testDiv);
    }, 100);
    
    console.groupEnd();
    
    return {
        thinkContainers: allThinkContainers.length,
        thinkHeaders: allThinkHeaders.length
    };
};

console.log('🔧 点击诊断函数已添加，可以在控制台运行 diagnoseThinkClick() 进行问题诊断');

// 添加CSS样式修复函数
window.fixThinkCSS = function() {
    console.group('🎨 修复Think容器CSS样式');
    
    // 检查是否需要添加或修复CSS样式
    let styleElement = document.getElementById('think-fix-styles');
    
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'think-fix-styles';
        styleElement.textContent = `
            /* Think容器修复样式 */
            .think-content {
                overflow: hidden !important;
                transition: max-height 0.4s ease-in-out, opacity 0.4s ease-in-out !important;
                padding: 0 !important;
            }
            
            .think-content.collapsed {
                max-height: 0 !important;
                opacity: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            
            .think-content.expanded {
                max-height: 2000px !important;
                opacity: 1 !important;
                padding: 0 !important;
            }
            
            .think-inner {
                padding: 16px !important;
                min-height: 20px !important;
            }
            
            .think-header {
                cursor: pointer !important;
                user-select: none !important;
            }
            
            .think-toggle-icon {
                transition: transform 0.3s ease-in-out !important;
            }
            
            .think-header:hover .think-toggle-icon {
                transform: scale(1.1);
            }
        `;
        
        document.head.appendChild(styleElement);
        console.log('✓ 已添加Think容器修复样式');
    } else {
        console.log('✓ Think容器修复样式已存在');
    }
    
    // 测试样式效果
    const testDiv = document.createElement('div');
    testDiv.className = 'think-content collapsed';
    testDiv.innerHTML = '<div class="think-inner">测试内容</div>';
    document.body.appendChild(testDiv);
    
    const computedStyle = getComputedStyle(testDiv);
    console.log('修复后的collapsed样式:');
    console.log('- maxHeight:', computedStyle.maxHeight);
    console.log('- opacity:', computedStyle.opacity);
    console.log('- padding:', computedStyle.padding);
    console.log('- overflow:', computedStyle.overflow);
    console.log('- transition:', computedStyle.transition);
    
    // 测试展开状态
    testDiv.classList.remove('collapsed');
    testDiv.classList.add('expanded');
    
    setTimeout(() => {
        const expandedStyle = getComputedStyle(testDiv);
        console.log('修复后的expanded样式:');
        console.log('- maxHeight:', expandedStyle.maxHeight);
        console.log('- opacity:', expandedStyle.opacity);
        console.log('- padding:', expandedStyle.padding);
        
        document.body.removeChild(testDiv);
        console.log('✓ CSS样式测试完成');
    }, 100);
    
    console.groupEnd();
};

// 自动执行CSS修复
window.fixThinkCSS();

console.log('🎨 CSS修复函数已添加，可以在控制台运行 fixThinkCSS() 手动修复样式');