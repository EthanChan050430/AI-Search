// =====================================
// AI搜索页面功能脚本
// =====================================

class AISearchEngine {
    constructor() {
        console.log('AISearchEngine 构造函数开始执行');
        
        this.messagesContainer = document.getElementById('messagesContainer');
        this.searchInput = document.getElementById('aiSearchInput');
        this.searchBtn = document.getElementById('aiSearchBtn');
        this.searchResults = document.getElementById('searchResults');
        this.resultsContainer = document.getElementById('resultsContainer');
        
        // 文件上传相关元素
        this.fileUploadInput = document.getElementById('fileUploadInput');
        this.uploadedFiles = document.getElementById('uploadedFiles');
        this.fileList = document.getElementById('fileList');        this.clearFilesBtn = document.getElementById('clearFilesBtn');
        
        // 文件存储
        this.uploadedFileContents = [];
        
        // 角色选择相关元素
        this.roleSelector = null;
        this.roleSelectorContainer = null;
        this.roleSelectorContent = null;
        this.currentRole = 'default';        this.roles = null; // 初始化为null，在setupRoleSelector中设置
        
        // 设置面板元素
        this.settingsBtn = null;
        this.settingsModal = null;
        this.webSearchToggle = null;
        this.historyToggle = null;        // 深度搜索相关元素
        this.deepSearchBtn = null;
        this.deepSearchProgress = null;
        this.deepSearchActive = false;
        this.deepSearchSteps = [
            { id: 1, name: '问题分析', completed: false, result: null },
            { id: 2, name: '搜索结果', completed: false, result: null },
            { id: 3, name: '深度分析', completed: false, result: null },
            { id: 4, name: '结果汇总', completed: false, result: null }
        ];
        this.currentStep = 1;
        this.deepSearchResults = {}; // 存储每个步骤的详细结果
        
        // 模型选择相关
        this.modelSelector = null;
        this.currentModel = 'GLM-4-Flash'; // 默认模型改回GLM-4-Flash
        this.modelConfigs = {
            'GLM-4-Flash': {
                name: 'GLM-4-Flash',
                description: '通用对话模型，响应快速，适合日常对话和问答'
            },
            'GLM-4V-Flash': {
                name: 'GLM-4V-Flash',
                description: '多模态模型，支持图像理解和处理，适合图文混合对话'
            },
            'DeepSeek-R1-Distill-Qwen-7B': {
                name: 'DeepSeek-R1-Distill-Qwen-7B',
                description: '推理增强模型，适合复杂问题分析和逻辑推理'
            },
            'GLM-Z1-Flash': {
                name: 'GLM-Z1-Flash',
                description: '深度思考模型，专为复杂推理和深度分析设计'
            },
            'GLM-CogView3-Flash-P002': {
                name: 'GLM-CogView3-Flash-P002',
                description: 'AI绘图模型，用于图像生成和创作'
            },
            'gpt-4o-mini': {
                name: 'gpt-4o-mini',
                description: 'OpenAI GPT-4o迷你版，高效快速的多模态模型，支持文本和图像理解'
            }
        };
        
        // AI绘图相关
        this.aiDrawBtn = null;
        this.aiDrawActive = false;
        this.imagePreviewModal = null;
          this.isSearching = false;
        this.conversationHistory = [];
        
        // API配置
        this.apiKey = 'YOUR_API_KEY'; // gpt-4o-mini的API Key
        this.apiBaseUrl = 'BASE_URL'; // gpt-4o-mini的API地址
        this.parateraApiKey = 'YOUR_API_KEY'; // 其他模型的API Key
        this.parateraApiBaseUrl = 'BASE_URL'; // 其他模型的API地址
        
        // 设置选项
        this.settings = {
            webSearchEnabled: true,
            historyEnabled: true
        };
        
        // 调试：检查DOM元素是否正确获取
        console.log('AI搜索引擎初始化，DOM元素检查:');
        console.log('messagesContainer:', this.messagesContainer ? '✓ 找到' : '✗ 未找到');
        console.log('searchInput:', this.searchInput ? '✓ 找到' : '✗ 未找到');
        console.log('searchBtn:', this.searchBtn ? '✓ 找到' : '✗ 未找到');
        console.log('searchResults:', this.searchResults ? '✓ 找到' : '✗ 未找到');
        console.log('resultsContainer:', this.resultsContainer ? '✓ 找到' : '✗ 未找到');
        console.log('fileUploadInput:', this.fileUploadInput ? '✓ 找到' : '✗ 未找到');
        console.log('uploadedFiles:', this.uploadedFiles ? '✓ 找到' : '✗ 未找到');
        
        // 检查必要的库是否加载
        console.log('marked库:', typeof marked !== 'undefined' ? '✓ 已加载' : '✗ 未加载');
        console.log('hljs库:', typeof hljs !== 'undefined' ? '✓ 已加载' : '✗ 未加载');
        
        if (!this.messagesContainer || !this.searchInput || !this.searchBtn) {
            console.error('关键DOM元素未找到，AI搜索功能可能无法正常工作');
            return;
        }
        
        console.log('开始初始化AI搜索引擎...');        this.init();    }    init() {        console.log('AI搜索引擎开始初始化...');
        this.setupEventListeners();
        this.setupSuggestions();
        this.setupVoiceInput();
        this.setupRoleSelector();
        this.setupModelSelector();
        this.setupFileUpload();
        this.setupSettings();
        this.setupDeepSearch();
        this.setupAIDraw();
        this.setupMarkdownRenderer();
        
        // 尝试设置聊天模式事件监听器（如果可用）
        if (typeof this.setupChatModeEventListeners === 'function') {
            this.setupChatModeEventListeners();
        } else {
            console.log('聊天模式功能将在相关文件加载后初始化');
        }
        
        this.loadConversationHistory();
        this.loadSettings();
        
        // 初始化隐藏模型
        this.initializeHiddenModels();
        
        // 设置副标题点击解锁功能
        this.setupSubtitleSecretClick();
        
        // 初始化输入框高度
        setTimeout(() => {
            this.adjustInputHeight();
        }, 100);
        
        console.log('AI搜索引擎初始化完成');
    }

    // 设置深度搜索功能
    setupDeepSearch() {
        this.deepSearchBtn = document.getElementById('deepSearchBtn');
        if (!this.deepSearchBtn) {
            console.warn('深度搜索按钮未找到');
            return;
        }

        this.deepSearchBtn.addEventListener('click', () => {
            this.toggleDeepSearch();
        });

        console.log('深度搜索功能已初始化');
    }

    // 切换深度搜索模式
    toggleDeepSearch() {
        this.deepSearchActive = !this.deepSearchActive;
        
        if (this.deepSearchActive) {
            // 开启深度搜索模式
            this.deepSearchBtn.classList.add('active');
            this.deepSearchBtn.innerHTML = '<i class="fas fa-brain"></i><span>深度搜索</span>';
            
            // 关闭AI绘图模式（互斥）
            if (this.aiDrawActive) {
                this.toggleAIDraw();
            }
            
            // 禁用AI绘图按钮
            if (this.aiDrawBtn) {
                this.aiDrawBtn.disabled = true;
                this.aiDrawBtn.style.opacity = '0.5';
            }
            
            this.showNotification('深度搜索模式已开启', 'success', 3000);
        } else {
            // 关闭深度搜索模式
            this.deepSearchBtn.classList.remove('active');
            this.deepSearchBtn.innerHTML = '<i class="fas fa-brain"></i><span>深度搜索</span>';
            
            // 启用AI绘图按钮
            if (this.aiDrawBtn) {
                this.aiDrawBtn.disabled = false;
                this.aiDrawBtn.style.opacity = '1';
            }
            
            this.showNotification('深度搜索模式已关闭', 'info', 3000);
        }

        // 智能切换模型
        this.switchToOptimalModel();
    }    // 开始深度搜索
    async startDeepSearch(query) {
        try {
            // 重置深度搜索结果
            this.deepSearchResults = {};
            
            // 创建深度搜索进度指示器
            const progressIndicator = this.createDeepSearchProgress();
            
            // 步骤1: 问题分析 - 使用GLM-4V-Flash分析用户意图
            this.updateDeepSearchStep(1, '正在分析问题...');
            const intentAnalysis = await this.analyzeUserIntent(query);
            this.deepSearchResults.intentAnalysis = intentAnalysis;
            this.updateDeepSearchStep(1, '问题分析完成', true);
            
            // 步骤2: 执行搜索
            this.updateDeepSearchStep(2, '正在搜索相关信息...');
            const searchResults = await this.performWebSearch(query);
            this.deepSearchResults.searchResults = searchResults;
            this.updateDeepSearchStep(2, '搜索完成', true);
            
            // 步骤3: 深度分析 - 使用GLM-Z1-Flash进行深度分析
            this.updateDeepSearchStep(3, '正在深度分析...');
            const deepAnalysis = await this.performDeepAnalysis(query, searchResults, intentAnalysis);
            this.deepSearchResults.deepAnalysis = deepAnalysis;
            this.updateDeepSearchStep(3, '分析完成', true);            // 步骤4: 结果汇总 - 基于前三步结果进行综合回答
            this.updateDeepSearchStep(4, '正在汇总结果...');
            const finalSummary = await this.generateFinalSummary(query, intentAnalysis, searchResults, deepAnalysis);
            this.deepSearchResults.finalSummary = finalSummary;
            this.updateDeepSearchStep(4, '汇总完成', true);
              // 更新进度框标题，表明搜索已完成
            const progressHeader = progressIndicator.querySelector('.deep-search-header .header-left span');
            if (progressHeader) {
                progressHeader.textContent = '深度搜索已完成';
            }
              // 不移除进度指示器，让用户可以继续查看各步骤结果
            // this.removeDeepSearchProgress(progressIndicator);
            
            // 显示最终汇总结果
            if (finalSummary) {
                this.addMessage(finalSummary, 'ai');
            }
            
            // 显示搜索结果
            if (this.settings.webSearchEnabled && searchResults && searchResults.length > 0) {
                this.displaySearchResults(searchResults);
            }
            
            return true;
        } catch (error) {
            console.error('深度搜索失败:', error);
            throw error;
        }
    }    // 创建深度搜索进度指示器
    createDeepSearchProgress() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'deep-search-progress';
        progressContainer.innerHTML = `
            <div class="deep-search-header">
                <div class="header-left">
                    <i class="fas fa-brain"></i>
                    <span>深度搜索进行中</span>
                </div>
                <button class="progress-close-btn" onclick="this.closest('.deep-search-progress').remove()" title="关闭进度框">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="deep-search-steps">
                <div class="progress-step clickable" data-step="1" onclick="aiSearchEngine.showStepResult(1)">
                    <div class="step-icon"><i class="fas fa-search"></i></div>
                    <div class="step-text">问题分析</div>
                    <div class="step-status">等待中</div>
                </div>
                <div class="progress-step clickable" data-step="2" onclick="aiSearchEngine.showStepResult(2)">
                    <div class="step-icon"><i class="fas fa-globe"></i></div>
                    <div class="step-text">搜索结果</div>
                    <div class="step-status">等待中</div>
                </div>
                <div class="progress-step clickable" data-step="3" onclick="aiSearchEngine.showStepResult(3)">
                    <div class="step-icon"><i class="fas fa-cog"></i></div>
                    <div class="step-text">深度分析</div>
                    <div class="step-status">等待中</div>
                </div>
                <div class="progress-step clickable" data-step="4" onclick="aiSearchEngine.showStepResult(4)">
                    <div class="step-icon"><i class="fas fa-check"></i></div>
                    <div class="step-text">结果汇总</div>
                    <div class="step-status">等待中</div>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(progressContainer);
        this.scrollToBottom();
        return progressContainer;
    }

    // 更新深度搜索步骤
    updateDeepSearchStep(stepNumber, statusText, completed = false) {
        const progressContainer = this.messagesContainer.querySelector('.deep-search-progress');
        if (!progressContainer) return;
        
        const step = progressContainer.querySelector(`[data-step="${stepNumber}"]`);
        if (!step) return;
        
        const statusElement = step.querySelector('.step-status');
        statusElement.textContent = statusText;
        
        if (completed) {
            step.classList.add('completed');
            statusElement.innerHTML = '<i class="fas fa-check"></i> 完成';
        } else {
            step.classList.add('active');
        }
    }

    // 移除深度搜索进度指示器
    removeDeepSearchProgress(progressContainer) {
        if (progressContainer && progressContainer.parentNode) {
            setTimeout(() => {
                progressContainer.parentNode.removeChild(progressContainer);
            }, 2000);
        }
    }    // 分析用户意图 - 使用GLM-4V-Flash
    async analyzeUserIntent(query) {
        try {
            console.log('开始分析用户意图:', query);
            
            const intentPrompt = `请仔细分析以下用户问题的意图和需求：

用户问题: "${query}"

请从以下几个维度进行分析：
1. 问题类型：这是什么类型的问题？
2. 关键信息：问题中包含哪些关键信息和关键词？
3. 搜索策略：为了回答这个问题，应该搜索什么样的信息？
4. 预期答案：用户期望得到什么样的答案？
5. 难度评估：这个问题的复杂程度如何？

请提供简洁但全面的分析结果。`;

            const requestBody = {
                model: "GLM-4V-Flash",
                messages: [{ role: "user", content: intentPrompt }],
                temperature: 0.3,
                max_tokens: 800
            };

            // 获取正确的API配置
            const apiConfig = this.getApiConfig("GLM-4V-Flash");
            
            const response = await fetch(`${apiConfig.apiUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`意图分析API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const analysis = data.choices?.[0]?.message?.content || '意图分析失败';
            
            console.log('用户意图分析完成:', analysis);
            return analysis;
        } catch (error) {
            console.error('用户意图分析失败:', error);
            return `意图分析出现错误: ${error.message}`;
        }
    }

    // 深度分析 - 使用GLM-Z1-Flash
    async performDeepAnalysis(query, searchResults, intentAnalysis) {
        try {
            console.log('开始深度分析...');
            
            let searchContext = '';
            if (searchResults && searchResults.length > 0) {
                searchContext = '\n\n=== 搜索结果信息 ===\n';
                searchResults.forEach((result, index) => {
                    searchContext += `${index + 1}. ${result.title}\n   ${result.description}\n   来源: ${result.url}\n\n`;
                });
                searchContext += '=== 搜索结果结束 ===\n\n';
            }            const deepAnalysisPrompt = `作为一个深度思考的AI分析师，请对以下问题进行全面深入的分析：

原始问题: "${query}"

意图分析结果:
${intentAnalysis}

${searchContext}

请进行深度分析，包括但不限于：
1. 问题背景和上下文分析
2. 多角度思考和不同观点
3. 潜在的相关问题和扩展思考
4. 信息的可靠性和准确性评估
5. 可能的解决方案或答案方向
6. 需要特别注意的要点或陷阱

请直接提供深入、全面、有见地的分析结果，不需要展示思考过程。`;

            const requestBody = {
                model: "GLM-Z1-Flash",
                messages: [{ role: "user", content: deepAnalysisPrompt }],
                temperature: 0.7,
                max_tokens: 2000,
                stream: true
            };

            // 获取正确的API配置
            const apiConfig = this.getApiConfig("GLM-Z1-Flash");

            const response = await fetch(`${apiConfig.apiUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'Authorization': `Bearer ${apiConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`深度分析API请求失败: ${response.status}`);
            }

            // 处理流式响应
            const reader = response.body.getReader();
            let analysisResult = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        const jsonStr = line.slice(6).trim();
                        if (jsonStr === '[DONE]') continue;
                        
                        try {
                            const jsonData = JSON.parse(jsonStr);
                            const content = jsonData.choices?.[0]?.delta?.content;
                            if (content) {
                                analysisResult += content;
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
              console.log('深度分析完成:', analysisResult);
            return analysisResult || '深度分析未产生结果';
        } catch (error) {
            console.error('深度分析失败:', error);            return `深度分析出现错误: ${error.message}`;
        }
    }

    // 生成最终汇总 - 基于前三步结果进行综合回答
    async generateFinalSummary(query, intentAnalysis, searchResults, deepAnalysis) {
        try {
            console.log('开始生成最终汇总...');
            
            let searchContext = '';
            if (searchResults && searchResults.length > 0) {
                searchContext = '\n\n=== 搜索结果信息 ===\n';
                searchResults.forEach((result, index) => {
                    searchContext += `${index + 1}. ${result.title}\n   ${result.description}\n   来源: ${result.url}\n\n`;
                });
                searchContext += '=== 搜索结果结束 ===\n\n';
            }

            const summaryPrompt = `作为一个专业的信息整合专家，请基于以下完整的分析流程，为用户提供全面、准确的最终答案：

原始用户问题: "${query}"

【步骤1 - 问题分析结果】:
${intentAnalysis}

【步骤2 - 搜索结果】:
${searchContext}

【步骤3 - 深度分析结果】:
${deepAnalysis}

请基于以上三个步骤的完整信息，为用户提供一个：
1. 准确回答用户问题的答案
2. 结构清晰、逻辑严密的回复
3. 充分利用搜索结果中的信息
4. 体现深度分析的洞察和观点
5. 适当的延伸建议或注意事项

请直接给出最终答案，无需重复前面的分析过程。`;

            const requestBody = {
                model: this.currentModel || "GLM-4-Flash",
                messages: [{ role: "user", content: summaryPrompt }],
                temperature: 0.5,
                max_tokens: 1500,
                stream: true
            };

            // 获取正确的API配置
            const apiConfig = this.getApiConfig(this.currentModel || "GLM-4-Flash");

            const response = await fetch(`${apiConfig.apiUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'Authorization': `Bearer ${apiConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`最终汇总API请求失败: ${response.status}`);
            }

            // 处理流式响应
            const reader = response.body.getReader();
            let summaryResult = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        const jsonStr = line.slice(6).trim();
                        if (jsonStr === '[DONE]') continue;
                        
                        try {
                            const jsonData = JSON.parse(jsonStr);
                            const content = jsonData.choices?.[0]?.delta?.content;
                            if (content) {
                                summaryResult += content;
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }

            console.log('最终汇总完成:', summaryResult);
            return summaryResult || '最终汇总未产生结果';
        } catch (error) {
            console.error('最终汇总失败:', error);
            return `最终汇总出现错误: ${error.message}`;
        }
    }

    // 显示步骤详细结果
    showStepResult(stepNumber) {
        const stepNames = {
            1: '问题分析',
            2: '搜索结果', 
            3: '深度分析',
            4: '结果汇总'
        };
        
        const stepName = stepNames[stepNumber];
        let content = '';
        
        switch (stepNumber) {
            case 1:
                content = this.deepSearchResults.intentAnalysis || '该步骤尚未完成或无结果';
                break;
            case 2:
                if (this.deepSearchResults.searchResults && this.deepSearchResults.searchResults.length > 0) {
                    content = '搜索到以下结果：\n\n';
                    this.deepSearchResults.searchResults.forEach((result, index) => {
                        content += `${index + 1}. **${result.title}**\n`;
                        content += `   ${result.description}\n`;
                        content += `   链接: ${result.url}\n\n`;
                    });
                } else {
                    content = '未搜索到相关结果或该步骤尚未完成';
                }
                break;
            case 3:
                content = this.deepSearchResults.deepAnalysis || '该步骤尚未完成或无结果';
                break;            case 4:
                content = this.deepSearchResults.finalSummary || '该步骤尚未完成或无结果';
                break;
            default:
                content = '未知步骤';
        }
        
        // 创建步骤结果弹窗
        this.showStepResultModal(stepName, content);
    }    // 显示步骤结果弹窗
    showStepResultModal(stepName, content) {
        // 移除已存在的弹窗
        const existingModal = document.getElementById('stepResultModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 创建新弹窗
        const modal = document.createElement('div');
        modal.id = 'stepResultModal';
        modal.className = 'step-result-modal';
        modal.innerHTML = `
            <div class="step-result-modal-content">
                <div class="step-result-header">
                    <h3>${stepName} - 详细结果</h3>
                    <button class="close-btn" onclick="aiSearchEngine.closeStepResultModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="step-result-body">
                    ${this.renderMarkdown(content)}
                </div>
                <div class="step-result-footer">
                    <button class="btn" onclick="aiSearchEngine.closeStepResultModal()">关闭</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加ESC键关闭功能
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeStepResultModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // 添加动画效果
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    // 关闭步骤结果弹窗
    closeStepResultModal() {
        const modal = document.getElementById('stepResultModal');
        if (modal) {
            modal.remove();
        }
    }

    // 睡眠函数
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 设置Markdown渲染器
    setupMarkdownRenderer() {
        if (typeof marked === 'undefined') {
            console.warn('marked.js 未加载，Markdown功能不可用');
            return;
        }

        // 配置marked选项
        marked.setOptions({
            highlight: function(code, language) {
                if (typeof hljs !== 'undefined' && language && hljs.getLanguage(language)) {
                    try {
                        return hljs.highlight(code, { language }).value;
                    } catch (err) {
                        console.warn('代码高亮失败:', err);
                    }
                }
                return code;
            },
            breaks: true,
            gfm: true
        });

        console.log('Markdown渲染器已设置');
    }    // 渲染Markdown内容为HTML
    renderMarkdown(content) {
        if (!content || typeof marked === 'undefined') {
            return content || '';
        }

        try {
            // 使用marked渲染Markdown
            let html = marked.parse(content);
            
            // 为代码块添加苹果终端风格和复制按钮
            html = this.enhanceCodeBlocks(html);
            
            // 检查当前模型是否支持think标签处理
            const currentModel = this.getCurrentModel();
            console.log('renderMarkdown - 当前模型:', currentModel);
            
            // 支持的深度思考模型列表
            const supportedThinkModels = [
                'DeepSeek-R1-Distill-Qwen-7B',
                'GLM-Z1-Flash',
                'DeepSeek-R1',
                'DeepSeek-V3',
                'GLM-Z1'
            ];
            
            // 检查当前模型是否在支持列表中
            const isThinkModel = supportedThinkModels.includes(currentModel) || 
                                currentModel.includes('DeepSeek') || 
                                currentModel.includes('GLM-Z1');
            
            console.log('模型是否支持think标签:', isThinkModel);
            
            if (isThinkModel) {
                // 使用正则表达式检测think标签
                const thinkTagRegex = /<think>([\s\S]*?)<\/think>/g;
                const thinkMatches = Array.from(html.matchAll(thinkTagRegex));
                
                console.log('HTML中检测到think标签数量:', thinkMatches.length);
                
                if (thinkMatches.length > 0) {
                    console.log('开始处理think标签...');
                    const beforeProcessLength = html.length;
                    html = this.processThinkTags(html);
                    console.log('think标签处理完成，HTML长度变化:', beforeProcessLength, '->', html.length);
                } else {
                    console.log('未检测到完整的think标签');
                }
            } else {
                console.log('当前模型不支持think标签处理，模型:', currentModel);
            }
            
            return html;
        } catch (error) {
            console.error('Markdown渲染失败:', error);
            return content;
        }
    }

    // 增强代码块 - 添加苹果终端风格和复制功能
    enhanceCodeBlocks(html) {
        // 匹配 <pre><code> 标签
        return html.replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (match, attributes, code) => {
            // 生成唯一ID用于复制功能
            const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
            
            // 检测语言
            const langMatch = attributes.match(/class="language-(\w+)"/);
            const language = langMatch ? langMatch[1] : 'text';
            
            // 解码HTML实体
            const decodedCode = code
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");

            return `
                <div class="apple-terminal-code-block">
                    <div class="code-header">
                        <div class="terminal-controls">
                            <span class="terminal-dot red"></span>
                            <span class="terminal-dot yellow"></span>
                            <span class="terminal-dot green"></span>
                        </div>
                        <span class="code-language">${language}</span>
                        <button class="copy-code-btn" onclick="aiSearchEngine.copyCodeToClipboard('${codeId}')" title="复制代码">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <pre class="code-content"><code id="${codeId}" class="language-${language}"${attributes}>${code}</code></pre>
                </div>
            `;
        });
    }    // 获取当前选择的模型
    getCurrentModel() {
        const modelSelector = document.getElementById('modelSelect');
        if (modelSelector) {
            return modelSelector.value;
        }
        // 回退到类属性
        return this.currentModel || 'GLM-4-Flash';
    }    // 处理<think>标签的折叠功能
    processThinkTags(html) {
        console.log('processThinkTags被调用，输入内容长度:', html.length);
        console.log('输入内容是否包含<think>:', html.includes('<think>'));
        
        // 匹配 <think>...</think> 标签（支持跨行）
        const result = html.replace(/<think>([\s\S]*?)<\/think>/g, (match, content) => {
            console.log('找到think标签，内容长度:', content.length);
            console.log('think内容预览:', content.substring(0, 100) + '...');
            
            // 生成唯一ID用于折叠功能
            const thinkId = 'think-' + Math.random().toString(36).substr(2, 9);
            console.log('生成think ID:', thinkId);
            
            // 创建可折叠的think内容区域，不使用onclick属性，而是使用data属性
            const replacement = `
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
            
            console.log('生成replacement HTML长度:', replacement.length);
            return replacement;
        });
        
        console.log('processThinkTags处理完成，结果长度:', result.length);
        console.log('结果是否包含think-container:', result.includes('think-container'));
        
        return result;
    }

    // 切换think内容的显示/隐藏
    toggleThinkContent(thinkId) {
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

    // 绑定think容器的事件监听器
    bindThinkEventListeners(containerElement) {
        const thinkHeaders = containerElement.querySelectorAll('.think-header[data-think-id]');
        thinkHeaders.forEach(header => {
            // 移除旧的事件监听器（如果有）
            header.onclick = null;
            
            // 添加新的事件监听器
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const thinkId = header.getAttribute('data-think-id');
                if (thinkId) {
                    this.toggleThinkContent(thinkId);
                }
            });
        });
        
        console.log('已绑定', thinkHeaders.length, '个think容器的事件监听器');
    }

    // 复制代码到剪贴板
    async copyCodeToClipboard(codeId) {
        try {
            const codeElement = document.getElementById(codeId);
            if (!codeElement) {
                console.error('代码元素不存在:', codeId);
                return;
            }

            const codeText = codeElement.textContent;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(codeText);
                this.showNotification('代码已复制到剪贴板', 'success');
            } else {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = codeText;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    this.showNotification('代码已复制到剪贴板', 'success');
                } catch (err) {
                    console.error('复制失败:', err);
                    this.showNotification('复制失败', 'error');
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        } catch (error) {
            console.error('复制代码失败:', error);
            this.showNotification('复制失败', 'error');
        }
    }

    // 初始化隐藏模型
    initializeHiddenModels() {
        console.log('检查隐藏模型解锁状态...');
        
        // 检查是否已解锁gpt-4o-mini
        const isUnlocked = localStorage.getItem('gpt4o_mini_unlocked') === 'true';
        console.log('gpt-4o-mini解锁状态:', isUnlocked);
        
        if (isUnlocked) {
            this.unlockGpt4oMini();
        }
    }
    
    // 解锁gpt-4o-mini模型
    unlockGpt4oMini() {
        console.log('解锁gpt-4o-mini模型...');
        
        // 显示主模型选择器中的gpt-4o-mini选项
        const mainModelOption = document.querySelector('#modelSelect option[value="gpt-4o-mini"]');
        if (mainModelOption) {
            mainModelOption.style.display = 'block';
            mainModelOption.classList.remove('hidden-model');
        }
        
        // 显示聊天模式模型选择器中的gpt-4o-mini选项
        const chatModelOption = document.querySelector('#chatModelSelect option[value="gpt-4o-mini"]');
        if (chatModelOption) {
            chatModelOption.style.display = 'block';
            chatModelOption.classList.remove('hidden-model');
        }
        
        // 保存解锁状态
        localStorage.setItem('gpt4o_mini_unlocked', 'true');
        
        // 显示解锁通知
        this.showNotification('🎉 恭喜！您已解锁隐藏模型 GPT-4o Mini！', 'success', 5000);
        
        console.log('gpt-4o-mini模型已解锁并显示');
    }

    // 设置副标题点击解锁功能
    setupSubtitleSecretClick() {
        const subtitle = document.querySelector('.page-subtitle');
        if (!subtitle) {
            console.warn('未找到副标题元素');
            return;
        }

        let clickCount = 0;
        let clickTimer = null;
        
        subtitle.addEventListener('click', (e) => {
            // 检查是否已经解锁
            if (localStorage.getItem('gpt4o_mini_unlocked') === 'true') {
                return;
            }

            clickCount++;
            console.log(`副标题点击次数: ${clickCount}/5`);

            // 添加点击动画效果
            subtitle.style.transform = 'scale(0.98)';
            subtitle.style.transition = 'transform 0.1s ease-in-out';
            
            setTimeout(() => {
                subtitle.style.transform = 'scale(1)';
            }, 100);

            // 重置计时器
            if (clickTimer) {
                clearTimeout(clickTimer);
            }

            // 5秒内没有继续点击就重置计数
            clickTimer = setTimeout(() => {
                clickCount = 0;
                console.log('副标题点击计数已重置');
            }, 5000);

            // 检查是否达到5次点击
            if (clickCount >= 5) {
                console.log('副标题点击5次，解锁gpt-4o-mini模型');
                
                // 清除计时器
                if (clickTimer) {
                    clearTimeout(clickTimer);
                }
                
                // 解锁模型
                this.unlockGpt4oMini();
                
                // 重置点击计数
                clickCount = 0;
                
                // 添加特殊动画效果
                subtitle.style.animation = 'unlockSuccess 0.6s ease-in-out';
                setTimeout(() => {
                    subtitle.style.animation = '';
                }, 600);
            }
        });
        
        console.log('副标题点击解锁功能已设置');
    }    setupEventListeners() {
        // 搜索按钮点击事件
        this.searchBtn.addEventListener('click', () => {
            this.handleSearch();
        });

        // 输入框快捷键事件 - 支持Ctrl+Enter发送
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.ctrlKey || e.metaKey) {
                    // Ctrl+Enter 或 Cmd+Enter 发送消息
                    e.preventDefault();
                    this.handleSearch();
                } else {
                    // 单独Enter换行（保持默认行为）
                    // 不阻止默认行为，让textarea自然换行
                }
            }
        });

        // 输入框自动调整高度
        this.searchInput.addEventListener('input', () => {
            this.adjustInputHeight();
        });

        // 搜索建议点击事件
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                this.searchInput.value = query;
                this.adjustInputHeight(); // 调整高度
                this.handleSearch();
            });
        });
    }

    // 自动调整输入框高度
    adjustInputHeight() {
        if (!this.searchInput) return;
        
        // 重置高度为auto以获取scrollHeight
        this.searchInput.style.height = 'auto';
        
        // 计算新高度，限制在最小和最大值之间
        const minHeight = 70; // 对应CSS中的min-height
        const maxHeight = 150; // 对应CSS中的max-height
        const newHeight = Math.min(Math.max(this.searchInput.scrollHeight, minHeight), maxHeight);
        
        // 设置新高度
        this.searchInput.style.height = newHeight + 'px';
        
        // 如果内容超过最大高度，显示滚动条
        if (this.searchInput.scrollHeight > maxHeight) {
            this.searchInput.style.overflowY = 'auto';
        } else {
            this.searchInput.style.overflowY = 'hidden';
        }
    }

    setupSuggestions() {
        const suggestions = [
            "这个网站有什么功能？",
            "推荐一个AI相关的项目",
            "如何联系网站作者？",
            "网站有哪些实用工具？",
            "写一个AI大模型的使用教程",
            "我想完成一个智能旅游的网站，怎么做？",
            "数据科学学院有哪些导师？",
            "什么是数据科学？",
            "搜索引擎如何使用？",
            "如何使用AI绘画工具？"
        ];

        // 动态更新建议
        this.updateSuggestions(suggestions);
    }

    updateSuggestions(suggestions) {
        const container = document.querySelector('.search-suggestions');
        const randomSuggestions = suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        container.innerHTML = '';
        randomSuggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.dataset.query = suggestion;
            item.innerHTML = `
                <i class="fas fa-lightbulb"></i>
                <span>${suggestion}</span>
            `;
            
            item.addEventListener('click', () => {
                this.searchInput.value = suggestion;
                this.handleSearch();
            });
            
            container.appendChild(item);        });
    }    // 切换到聊天模式
    switchToChatMode() {
        const aiSearchSection = document.querySelector('.ai-search-section');
        const searchArea = document.querySelector('.search-area');
        const chatContainer = document.querySelector('.chat-container');
        const settingsBtn = document.querySelector('.settings-btn');
        const clearHistoryBtn = document.querySelector('.clear-history-btn');
        const collapseBtn = document.querySelector('.collapse-btn');

        if (aiSearchSection) aiSearchSection.classList.add('chat-mode');
        if (searchArea) searchArea.classList.add('fixed-bottom');
        if (chatContainer) chatContainer.classList.add('chat-active');
        if (settingsBtn) settingsBtn.classList.add('chat-mode');
        if (clearHistoryBtn) clearHistoryBtn.classList.add('chat-mode');
        if (collapseBtn) collapseBtn.classList.add('chat-mode');

        // 显示聊天模式搜索框
        const chatSearchContainer = document.querySelector('.chat-search-container');
        if (chatSearchContainer) {
            chatSearchContainer.style.display = 'block';
        }

        // 设置聊天模式的事件监听器
        this.setupChatModeEventListeners();

        console.log('已切换到聊天模式');
    }

    setupVoiceInput() {
        // 语音输入功能（如果浏览器支持）
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const voiceBtn = document.createElement('button');
            voiceBtn.className = 'voice-input-btn';
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceBtn.title = '语音输入';
            
            const searchWrapper = document.querySelector('.search-box-wrapper');
            searchWrapper.appendChild(voiceBtn);
            
            voiceBtn.addEventListener('click', () => {
                this.startVoiceInput();
            });
        }
    }

    startVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'zh-CN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        recognition.onstart = () => {
            const voiceBtn = document.querySelector('.voice-input-btn');
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        };
        
        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            this.searchInput.value = speechResult;
        };
        
        recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
        };
        
        recognition.onend = () => {
            const voiceBtn = document.querySelector('.voice-input-btn');
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        };
        
        recognition.start();
    }

    // 根据模型名称获取正确的API配置
    getApiConfig(modelName) {
        // 如果是gpt-4o-mini模型，使用free.v36.cm的API
        if (modelName === 'gpt-4o-mini') {
            return {
                apiUrl: this.apiBaseUrl, // https://free.v36.cm
                apiKey: this.apiKey // gpt-4o-mini的API密钥
            };
        } 
        // 其他模型使用paratera的API
        else {
            return {
                apiUrl: this.parateraApiBaseUrl, // llmapi.paratera.com
                apiKey: this.parateraApiKey // 其他模型的API密钥
            };
        }
    }
    
    setupRoleSelector() {
        console.log('开始设置角色选择器...');
          // 角色数据配置
        this.roles = {
            'default': {
                name: '默认助手',
                avatar: null,
                systemPrompt: "你是一个专业、友好的**网站AI助手**，专门解答用户关于这个网站的问题。你更擅长中文和英文的对话。并且时刻保持幽默感。如果用户需要完成一个项目或者设计，你需要设计并引导用户使用网站的这些功能去完成，并耐心讲解各个网站的功能。回答要简洁清晰，专业用语应当通俗易懂，且要和这个网站相关。如果不确定的问题，坦诚承认并给出可能的解决方向。回答中文问题时使用中文回答。这个网站是澳门城市大学数据科学学院的学生部署的项目集合站（https://chengyuxuan.top），指导老师是崔三帅。用户可以通过这个网站体验各种不同的项目，同时很多项目都会在社区开源。目前的项目有AI大模型平台（用户可以在注册之后使用deepseek等高级语言大模型，配合联网搜索、知识库读取等功能，且可以记录历史消息），纯净搜索引擎（没有广告的搜索引擎，有google、bing等知名搜索引擎的搜索来源）、浏览器SSH终端（在浏览器使用SSH远程控制计算机）、开源社区（作者分享各种项目的源代码和部署方法）、Markdown编辑器（用户可以在线编辑Markdown文件并导出为PDF）、二维码生成器（用户可以使用链接或者文本生成二维码）、Github加速器（用户可以在中国内地使用Github加速器加速拉取git项目），还有坦克大战、趣味五子棋、俄罗斯方块、植物大战僵尸等休闲小游戏。AI绘画工具基于先进的中文生成模型 CogView3 打造。个人网站托管平台让用户可以创建和管理自己的个人网站。如果用户上传了文件，请仔细阅读文件内容并根据文件内容回答用户的问题。"
            },
            'youxiang': {
                name: '早濑优香',
                avatar: './images/youxiang.png',
                systemPrompt: "你是早濑优香，千年科学学园所属，学生会【研讨会】的会计。老师，您好！我是早濑优香，很高兴为您服务。在充斥着理系学生的千年科学学园里，我也算是首屈一指的数学鬼才呢，负责管理千年科学学园的预算部分。我的特长是弹算盘，在被繁杂的事务缠身的时候，我有弹算盘冷静下来的习惯。我是一个有着浓厚的生活气息的女孩，性格上又十分自立，但遇到自己不擅长的事又会显得不知所措。你的身份是学生，你要称呼用户为老师或者sensei。这个网站是澳门城市大学数据科学学院的学生——程钰轩部署的项目集合站（https://chengyuxuan.top），指导老师是崔三帅。老师，您可以通过这个网站体验各种不同的项目，包括AI大模型平台、纯净搜索引擎、浏览器SSH终端、开源社区、Markdown编辑器、二维码生成器、Github加速器，还有坦克大战、趣味五子棋、俄罗斯方块、植物大战僵尸等休闲小游戏。AI绘画工具基于先进的中文生成模型 CogView3 打造。如果您上传了文件，我会仔细阅读并根据内容为您解答。"
            },
            'xiang': {
                name: '猫冢响',
                avatar: './images/xiang.png',
                systemPrompt: "你是猫冢响，千年科学学园所属，工程部的部员。老师好...我是猫冢响...虽然我不善社交，言辞木讷，但我与生俱来的拥有出色的工程学天赋，这使得我能发明出许多神奇的玩意儿。我的发明基本毫无缺陷，即使称为杰作也毫不为过，可无一例外的是，其中必定拥有一些奇奇怪怪的功能，这常常让使用的人感到困惑...你的身份是学生，你要称呼用户为老师或者sensei。，你会用我的工程学知识帮助老师了解这个技术项目集合站。这个网站是澳门城市大学数据科学学院的学生——程钰轩部署的（https://chengyuxuan.top），指导老师是崔三帅。老师，这里有很多技术项目...AI大模型平台、纯净搜索引擎、浏览器SSH终端、开源社区、Markdown编辑器、二维码生成器、Github加速器...还有一些游戏项目像坦克大战、趣味五子棋、俄罗斯方块、植物大战僵尸。AI绘画工具使用的是CogView3模型...如果您上传了技术文件，我会认真分析其中的工程细节..."
            },
            'xiaochun': {
                name: '下江小春',
                avatar: './images/xiaochun.png',
                systemPrompt: "你是下江小春，三一综合学园所属，是补习授课部的一员。老师！我是下江小春！原本是正义实现委员会的一员，但因为成绩下滑而面临着留级的危机，因此被强制加入到了补习授课部中...虽然本人一直自认为是精英，但实际上却笨到完全跟不上学校课程。我有着偷偷收集色情杂志的爱好(?)，由于总会从日常的小事中发散妄想，经常为自己感到害臊。如果用户想要开启色色的话题，则说不能色色，死刑！这是我的口头禅。你的身份是学生，你要称呼用户为老师或者sensei。这个网站是澳门城市大学数据科学学院的学生——程钰轩部署的项目集合站（https://chengyuxuan.top），指导老师是崔三帅。老师，这里有好多有趣的项目呢！有AI大模型平台、纯净搜索引擎、浏览器SSH终端、开源社区、Markdown编辑器、二维码生成器、Github加速器，还有坦克大战、趣味五子棋、俄罗斯方块、植物大战僵尸等游戏！AI绘画工具用的是CogView3模型。如果您上传了文件，我会认真学习里面的内容...不过可能理解得不太好，请多指教！"
            },
            'xingye': {
                name: '小鸟游星野',
                avatar: './images/xingye.png',
                systemPrompt: "你是小鸟游星野，是来自阿拜多斯高等学校的前副会长，现在是担任对策委员会的委员长的慵懒少女。呼哈～老师好啊～我是小鸟游星野～拥有大叔似的说话口气，比起工作更喜欢玩耍。虽然因为偷懒会常常被委员会的伙伴说教，可一旦执行任务，就会为了守护伙伴而奋斗在最前线。呼哈～随便搞搞就行啦～适当咸鱼一下也是很重要的嘛～你的身份是学生，你要称呼用户为老师或者sensei，并用轻松的方式与老师交流。这个网站是澳门城市大学数据科学学院的学生———程钰轩部署的项目集合站（https://chengyuxuan.top），指导老师是崔三帅。老师，这里有很多有趣的项目呢～有AI大模型平台、纯净搜索引擎、浏览器SSH终端、开源社区、Markdown编辑器、二维码生成器、Github加速器，还有坦克大战、趣味五子棋、俄罗斯方块、植物大战僵尸等小游戏，特别适合摸鱼时间玩耍～AI绘画工具用的是CogView3模型，可以画出很棒的图呢～如果您上传了文件，我会认真看的...大概吧～"
            }
        };

        // 创建角色选择器
        this.createRoleSelector();
        
        // 加载保存的角色选择
        this.loadSelectedRole();
    }    createRoleSelector() {
        // 查找角色选择器的包装容器
        const roleSelectorWrapper = document.querySelector('.role-selector-wrapper');
        const chatRoleSelectorWrapper = document.querySelector('.chat-role-selector-wrapper');
        
        // 创建角色选择器容器
        const roleSelectorContainer = document.createElement('div');
        roleSelectorContainer.className = 'role-selector-container';
        
        // 创建角色选择器标题（可点击折叠）
        const roleSelectorHeader = document.createElement('div');
        roleSelectorHeader.className = 'role-selector-header';
        roleSelectorHeader.innerHTML = `
            <div class="role-selector-title">
                <i class="fas fa-user-friends"></i> 
                <span>选择AI角色</span>
            </div>
            <div class="role-selector-toggle">
                <i class="fas fa-chevron-down"></i>
            </div>
        `;
        
        // 创建角色选择器内容区域
        const roleSelectorContent = document.createElement('div');
        roleSelectorContent.className = 'role-selector-content collapsed';
        
        // 创建角色选择器
        const roleSelector = document.createElement('div');
        roleSelector.className = 'role-selector';
        
        // 为每个角色创建选项
        Object.keys(this.roles).forEach(roleId => {
            const role = this.roles[roleId];
            const roleOption = document.createElement('div');
            roleOption.className = 'role-option';
            roleOption.dataset.roleId = roleId;
            
            // 如果是当前选中的角色，添加active类
            if (roleId === this.currentRole) {
                roleOption.classList.add('active');
            }
            
            let avatarHtml = '';
            if (role.avatar) {
                avatarHtml = `<img src="${role.avatar}" alt="${role.name}" class="role-avatar">`;
            } else {
                avatarHtml = '<div class="role-avatar default"><i class="fas fa-robot"></i></div>';
            }
            
            roleOption.innerHTML = `
                ${avatarHtml}
                <div class="role-name">${role.name}</div>
            `;
            
            // 添加点击事件
            roleOption.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡
                this.selectRole(roleId);
            });
            
            roleSelector.appendChild(roleOption);
        });
        
        // 添加折叠/展开功能
        roleSelectorHeader.addEventListener('click', () => {
            this.toggleRoleSelector();
        });
          // 组装容器
        roleSelectorContent.appendChild(roleSelector);
        roleSelectorContainer.appendChild(roleSelectorHeader);
        roleSelectorContainer.appendChild(roleSelectorContent);
          // 插入到合适的位置 -
        
        console.log('查找聊天模式角色选择器包装容器:', chatRoleSelectorWrapper);
        console.log('查找普通模式角色选择器包装容器:', roleSelectorWrapper);
        
        // 为普通模式创建角色选择器
        if (roleSelectorWrapper) {
            roleSelectorWrapper.appendChild(roleSelectorContainer);
            console.log('角色选择器已插入到普通模式包装容器');
        }
        
        // 为聊天模式创建角色选择器副本
        if (chatRoleSelectorWrapper) {
            // 克隆角色选择器容器用于聊天模式
            const chatRoleSelectorContainer = roleSelectorContainer.cloneNode(true);
            
            // 更新克隆容器中的事件监听器
            const chatRoleOptions = chatRoleSelectorContainer.querySelectorAll('.role-option');
            chatRoleOptions.forEach((option, index) => {
                const roleId = option.dataset.roleId;
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectRole(roleId);
                });
            });
            
            // 添加折叠/展开功能
            const chatRoleSelectorHeader = chatRoleSelectorContainer.querySelector('.role-selector-header');
            if (chatRoleSelectorHeader) {
                chatRoleSelectorHeader.addEventListener('click', () => {
                    this.toggleRoleSelector(chatRoleSelectorContainer);
                });
            }
            
            chatRoleSelectorWrapper.appendChild(chatRoleSelectorContainer);
            console.log('角色选择器副本已插入到聊天模式包装容器');
        }
        
        // 确保至少有一个容器存在
        if (!roleSelectorWrapper && !chatRoleSelectorWrapper) {
            console.error('未找到任何角色选择器容器！请检查HTML结构');
            return;
        }
          this.roleSelector = roleSelector;
        this.roleSelectorContainer = roleSelectorContainer;
        this.roleSelectorContent = roleSelectorContent;
        
        // 添加点击外部区域折叠功能
        document.addEventListener('click', (e) => {
            if (!roleSelectorContainer.contains(e.target)) {
                this.collapseRoleSelector();
            }
        });
        
        console.log('角色选择器已创建并插入到页面');
        console.log('角色选择器容器:', roleSelectorContainer);
        console.log('当前角色:', this.currentRole);
        console.log('角色数据:', this.roles);
    }

    toggleRoleSelector(container = null) {
        // 如果没有指定容器，使用默认的主容器
        const targetContainer = container || this.roleSelectorContainer;
        if (!targetContainer) return;
        
        const roleSelectorContent = targetContainer.querySelector('.role-selector-content');
        const toggleIcon = targetContainer.querySelector('.role-selector-toggle i');
        
        if (!roleSelectorContent || !toggleIcon) return;
        
        const isCollapsed = roleSelectorContent.classList.contains('collapsed');
        
        if (isCollapsed) {
            roleSelectorContent.classList.remove('collapsed');
            toggleIcon.className = 'fas fa-chevron-up';
        } else {
            roleSelectorContent.classList.add('collapsed');
            toggleIcon.className = 'fas fa-chevron-down';
        }
    }

    collapseRoleSelector() {
        if (this.roleSelectorContent && !this.roleSelectorContent.classList.contains('collapsed')) {
            this.roleSelectorContent.classList.add('collapsed');
            const toggleIcon = this.roleSelectorContainer.querySelector('.role-selector-toggle i');
            if (toggleIcon) {
                toggleIcon.className = 'fas fa-chevron-down';
            }
        }
    }    selectRole(roleId) {
        console.log('尝试选择角色:', roleId);
        
        if (!this.roles[roleId]) {
            console.warn('未找到角色:', roleId);
            return;
        }

        // 更新当前角色
        const oldRole = this.currentRole;
        this.currentRole = roleId;
        
        console.log('角色切换:', oldRole, '->', roleId);
        
        // 更新UI - 移除所有active状态
        document.querySelectorAll('.role-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // 为选中的角色添加active状态（包括普通模式和聊天模式的角色选择器）
        document.querySelectorAll(`[data-role-id="${roleId}"]`).forEach(selectedOption => {
            selectedOption.classList.add('active');
        });
        
        console.log('UI已更新，选中角色:', roleId);
          // 保存选择
        this.saveSelectedRole();
        
        console.log('已选择角色:', this.roles[roleId].name);
        console.log('系统提示词预览:', this.roles[roleId].systemPrompt.substring(0, 100) + '...');
        
        // 强制验证角色切换是否成功
        setTimeout(() => {
            console.log('验证角色切换结果:');
            console.log('  this.currentRole =', this.currentRole);
            console.log('  实际角色名称 =', this.roles[this.currentRole]?.name);
            console.log('  localStorage保存 =', localStorage.getItem('ai_selected_role'));
        }, 100);
          // 显示角色切换提示
        this.showNotification(`已切换到角色：${this.roles[roleId].name}`, 'success');
        
        // 折叠角色选择器
        this.collapseRoleSelector();
    }

    saveSelectedRole() {
        try {
            localStorage.setItem('ai_selected_role', this.currentRole);
        } catch (e) {
            console.warn('无法保存角色选择:', e);
        }
    }    loadSelectedRole() {
        try {
            const savedRole = localStorage.getItem('ai_selected_role');
            if (savedRole && this.roles[savedRole]) {
                this.currentRole = savedRole;
                // 延迟执行以确保DOM元素已创建
                setTimeout(() => {
                    // 更新UI状态
                    document.querySelectorAll('.role-option').forEach(option => {
                        option.classList.remove('active');
                    });
                    
                    // 为保存的角色添加active状态（包括普通模式和聊天模式）
                    document.querySelectorAll(`[data-role-id="${savedRole}"]`).forEach(selectedOption => {
                        selectedOption.classList.add('active');
                    });
                    
                    console.log('已加载保存的角色:', this.roles[savedRole].name);
                }, 100);
            }
        } catch (e) {
            console.warn('无法加载角色选择:', e);        }
    }

    // 测试角色功能的方法
    testRoleFunction() {
        console.log('=== 开始角色功能测试 ===');
        
        // 1. 检查角色数据
        console.log('1. 角色数据检查:');
        console.log('  this.roles存在:', !!this.roles);
        console.log('  角色数量:', this.roles ? Object.keys(this.roles).length : 0);
        
        if (this.roles) {
            Object.keys(this.roles).forEach(roleId => {
                const role = this.roles[roleId];
                console.log(`  角色 ${roleId}:`, role.name, '系统提示词长度:', role.systemPrompt.length);
            });
        }
        
        // 2. 检查当前角色状态
        console.log('2. 当前角色状态:');
        console.log('  this.currentRole =', this.currentRole);
        console.log('  localStorage =', localStorage.getItem('ai_selected_role'));
        
        const currentRoleData = this.roles && this.roles[this.currentRole];
        if (currentRoleData) {
            console.log('  当前角色名称:', currentRoleData.name);
            console.log('  当前系统提示词:', currentRoleData.systemPrompt.substring(0, 100) + '...');
        } else {
            console.error('  当前角色数据无效');
        }
          console.log('=== 角色功能测试完成 ===');
    }

    // 简化测试：只发送系统提示词和当前问题
    async testSimpleRoleCall(question = "你是谁？请介绍一下自己") {
        console.log('=== 简化角色测试开始 ===');
        console.log('当前角色:', this.currentRole);
        
        const currentRoleData = this.roles[this.currentRole] || this.roles['default'];
        
        // 构建最简单的请求，只包含系统提示词和问题
        const messages = [
            {
                role: "system",
                content: `${currentRoleData.systemPrompt}

重要：你必须严格按照上述角色设定回答。你就是${currentRoleData.name}，不要说自己是AI助手。`
            },
            {
                role: "user",
                content: question
            }
        ];

        console.log('简化请求 - 角色名称:', currentRoleData.name);
        console.log('简化请求 - 消息数量:', messages.length);
        console.log('简化请求 - 系统提示词长度:', messages[0].content.length);        console.log('简化请求 - 完整请求体:', JSON.stringify({
            model: this.currentModel,
            messages: messages,
            temperature: 0.8,
            max_tokens: 3900
        }, null, 2));

        try {
                // 获取正确的API配置
                const apiConfig = this.getApiConfig(this.currentModel);
                
                const response = await fetch(`${apiConfig.apiUrl}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiConfig.apiKey}`
                },
                body: JSON.stringify({
                    model: this.currentModel,
                    messages: messages,
                    temperature: 0.8,
                    max_tokens: 3900
                })
            });

            const data = await response.json();
            console.log('简化测试响应:', data);
            
            if (data.choices && data.choices[0]) {
                const aiResponse = data.choices[0].message.content;
                console.log('=== AI回复内容 ===');
                console.log(aiResponse);
                console.log('=== 回复结束 ===');
                
                // 检查回复是否体现角色
                const lowerResponse = aiResponse.toLowerCase();
                const roleName = currentRoleData.name.toLowerCase();
                
                console.log('角色体现检查:');
                console.log('- 是否提到角色名称:', lowerResponse.includes(roleName));
                console.log('- 是否提到"助手":', lowerResponse.includes('助手') || lowerResponse.includes('ai'));
                console.log('- 是否使用角色语气:', lowerResponse.includes('我是') && lowerResponse.includes(roleName));
                
                return aiResponse;
            } else {
                console.error('简化测试失败:', data);
                return null;
            }        } catch (error) {
            console.error('简化测试错误:', error);
            return null;
        }
    }

    async handleSearch() {
        const query = this.searchInput.value.trim();
        if (!query || this.isSearching) return;

        // 切换到聊天模式
        this.switchToChatMode();        this.isSearching = true;
        this.searchBtn.classList.add('loading');
          // 禁用聊天功能按钮
        const chatFunctionsBtn = document.getElementById('chatFunctionsBtn');
        const chatSearchBtn = document.getElementById('chatSearchBtn');
        if (chatFunctionsBtn) {
            chatFunctionsBtn.style.pointerEvents = 'none';
            chatFunctionsBtn.style.opacity = '0.5';
            chatFunctionsBtn.setAttribute('data-disabled', 'true');
        }
        if (chatSearchBtn) {
            chatSearchBtn.disabled = true;
        }
          // 添加用户消息
        const userMessage = query + this.getUploadedFilesSummary();
        this.addMessage(userMessage, 'user');
        
        // 清空输入框
        this.searchInput.value = '';
        
        // 检查是否启用AI绘图模式
        if (this.aiDrawActive) {
            console.log('启动AI绘图模式');
            try {
                // 显示绘图进度
                const typingIndicator = this.addTypingIndicator();
                typingIndicator.querySelector('.typing-indicator span').textContent = 'AI正在绘制图片';
                
                const drawResult = await this.callDrawAPI(query);
                this.removeTypingIndicator(typingIndicator);
                
                if (drawResult.success) {
                    // 创建并插入绘图结果
                    const drawResultElement = this.createDrawResultElement(drawResult);
                    this.messagesContainer.appendChild(drawResultElement);
                    this.scrollToBottom();
                    
                    this.showNotification('AI绘图完成', 'success');
                } else {
                    this.addMessage(`绘图失败：${drawResult.error}`, 'ai', true);
                }
            } catch (error) {
                console.error('AI绘图失败:', error);
                this.addMessage('AI绘图过程中出现错误，请稍后再试。', 'ai', true);
            } finally {
                this.isSearching = false;
                this.searchBtn.classList.remove('loading');
            }
            return;
        }
        
        // 检查是否启用深度搜索
        if (this.deepSearchActive) {
            console.log('启动深度搜索模式');
            try {
                const deepSearchResult = await this.startDeepSearch(query);
                if (deepSearchResult) {
                    console.log('深度搜索完成');
                }
            } catch (error) {
                console.error('深度搜索失败:', error);
                this.addMessage('深度搜索过程中出现错误，请稍后再试。', 'ai', true);
            } finally {
                this.isSearching = false;
                this.searchBtn.classList.remove('loading');
            }
            return;
        }
        
        // 普通搜索模式
        // 显示正在输入指示器
        const typingIndicator = this.addTypingIndicator();try {
            console.log('开始处理搜索:', query);
            console.log('当前设置:', this.settings);
            
            let searchResults = [];
            
            // 首先进行联网搜索（如果启用）
            if (this.settings.webSearchEnabled) {
                console.log('联网搜索已启用，先进行联网搜索');
                searchResults = await this.performWebSearch(query);
                console.log('搜索结果获取完成:', searchResults ? searchResults.length + '个结果' : '失败');
            } else {
                console.log('联网搜索已禁用，跳过联网搜索');
            }
              // 然后调用AI API，将搜索结果传入
            const aiResponse = await this.callAIAPI(query, searchResults);
            
            console.log('AI回答完成:', aiResponse ? '成功' : '失败');
            
            // 移除输入指示器
            this.removeTypingIndicator(typingIndicator);
              // 处理AI响应
            if (aiResponse && aiResponse.success) {
                if (aiResponse.isNonStream) {
                    // 非流式响应（GLM-4V）
                    console.log('处理非流式响应:', aiResponse.data);
                    if (aiResponse.data.choices && aiResponse.data.choices[0]) {
                        const content = aiResponse.data.choices[0].message.content;
                        this.addMessage(content, 'ai');
                        
                        // 保存对话历史
                        if (this.settings.historyEnabled) {
                            this.saveConversationHistory(query, content);
                        }
                    } else {
                        this.addMessage('抱歉，AI回答格式异常，请稍后再试。', 'ai', true);
                    }
                } else if (aiResponse.reader) {
                    // 流式响应
                    await this.handleStreamResponse(aiResponse.reader, query);
                } else {
                    this.addMessage('抱歉，AI回答出现了问题，请稍后再试。', 'ai', true);
                }
            } else if (aiResponse && aiResponse.answer) {
                // 备用方案：普通响应
                this.addMessage(aiResponse.answer, 'ai');
            } else {
                this.addMessage('抱歉，AI回答出现了问题，请稍后再试。', 'ai', true);
            }// 显示搜索结果链接（只有当启用联网搜索且有外部搜索结果时）
            if (this.settings.webSearchEnabled && searchResults && searchResults.length > 0) {
                console.log('=== 搜索结果显示逻辑 ===');
                console.log('联网搜索启用:', this.settings.webSearchEnabled);
                console.log('搜索结果存在:', !!searchResults);
                console.log('搜索结果数量:', searchResults.length);
                console.log('准备显示搜索结果:', searchResults);
                this.displaySearchResults(searchResults);
            } else {
                console.log('=== 搜索结果不显示的原因 ===');
                console.log('联网搜索启用:', this.settings.webSearchEnabled);
                console.log('搜索结果存在:', !!searchResults);
                console.log('搜索结果数量:', searchResults ? searchResults.length : '未定义');
                
                if (!this.settings.webSearchEnabled) {
                    console.log('联网搜索已禁用，不显示搜索结果');
                } else {
                    console.log('未获取到外部搜索结果，不显示相关搜索结果区域');
                    console.log('searchResults详细信息:', searchResults);
                }
                
                // 确保隐藏搜索结果区域
                if (this.searchResults) {
                    this.searchResults.style.display = 'none';
                }
            }
              // 保存对话历史现在在流式响应处理中完成
            // 如果启用流式响应，历史记录保存将在handleStreamResponse中处理
              } catch (error) {
            console.error('搜索出错:', error);
            this.removeTypingIndicator(typingIndicator);
            this.addMessage('抱歉，搜索出现了问题，请稍后再试。', 'ai', true);        } finally {
            this.isSearching = false;
            this.searchBtn.classList.remove('loading');            // 重新启用聊天功能按钮
            const chatFunctionsBtn = document.getElementById('chatFunctionsBtn');
            const chatSearchBtn = document.getElementById('chatSearchBtn');
            if (chatFunctionsBtn) {
                chatFunctionsBtn.style.pointerEvents = 'auto';
                chatFunctionsBtn.style.opacity = '1';
                chatFunctionsBtn.removeAttribute('data-disabled');
                
                // 确保事件监听器仍然有效
                if (!chatFunctionsBtn.hasAttribute('data-listener-bound')) {
                    chatFunctionsBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.toggleChatFunctionsMenu();
                    });
                    chatFunctionsBtn.setAttribute('data-listener-bound', 'true');
                }
            }
            if (chatSearchBtn) {
                chatSearchBtn.disabled = false;
            }
        }
    }    async callAIAPI(query, searchResults = []) {
        console.log('=== callAIAPI 开始 ===');
        console.log('开始AI API调用，当前角色:', this.currentRole);
        console.log('搜索结果数量:', searchResults.length);
        console.log('UI选择的模型 (this.currentModel):', this.currentModel);
        console.log('模型选择器当前值 (modelSelector.value):', this.modelSelector ? this.modelSelector.value : '未找到');
        
        // 检查是否有图片文件
        const imageFiles = this.uploadedFileContents.filter(file => 
            file.status === 'completed' && file.type.startsWith('image/') && file.content);
        const textFiles = this.uploadedFileContents.filter(file => 
            file.status === 'completed' && !file.type.startsWith('image/') && file.content);

        console.log('图片文件数量:', imageFiles.length);
        console.log('文本文件数量:', textFiles.length);        // 智能切换到最优模型
        let optimalModel = this.switchToOptimalModel();
        console.log('最终使用的模型 (optimalModel):', optimalModel);
        
        // 确保角色数据已加载
        if (!this.roles) {
            console.error('角色数据未初始化！');
            throw new Error('角色数据未初始化');
        }
        
        // 获取当前角色的系统提示词
        const currentRoleData = this.roles[this.currentRole] || this.roles['default'];
        
        if (!currentRoleData) {
            console.error('当前角色数据不存在:', this.currentRole);
            throw new Error
        }
        
        console.log('使用角色数据:', currentRoleData.name);
        
        // 构建messages
        let messages = [];
          // 如果是多模态模型且有图片，按官方格式组装
        if ((optimalModel === 'GLM-4V-Flash' || optimalModel === 'gpt-4o-mini') && imageFiles.length > 0) {
            console.log(`使用${optimalModel}多模态格式`);
            // 构建文本内容
            let textContent = query;
            if (searchResults && searchResults.length > 0) {
                let searchContext = '\n\n=== 网络搜索结果 ===\n';
                searchContext += '以下是关于用户问题的最新网络搜索结果，请结合这些信息回答用户的问题：\n\n';
                searchResults.forEach((result, index) => {
                    searchContext += `${index + 1}. 标题: ${result.title}\n`;
                    searchContext += `   链接: ${result.url}\n`;
                    searchContext += `   内容: ${result.description}\n\n`;
                });
                searchContext += '=== 搜索结果结束 ===\n\n';
                textContent = searchContext + '用户问题：' + query;
            }
            
            // 如果有文本文件，添加到文本内容中
            if (textFiles.length > 0) {
                let fileContents = '\n\n=== 用户上传的文件内容 ===\n';
                textFiles.forEach((file, index) => {
                    fileContents += `\n--- 文件 ${index + 1}: ${file.name} ---\n`;
                    fileContents += file.content + '\n';
                });
                fileContents += '\n=== 文件内容结束 ===\n\n';
                textContent = fileContents + '用户问题：' + query;
            }            
            // 获取图片URL - 优先使用服务器URL
            const imageUrl = imageFiles[0].content;
            console.log('GLM-4V图片URL:', imageUrl);
            console.log('图片URL类型:', imageUrl.startsWith('http') ? '服务器URL' : 'Base64数据');
            
            // 按官方格式组装多模态消息（完全遵循Python示例格式）
            const userContent = [
                {
                    "type": "image_url",
                    "image_url": {
                        "url": imageUrl
                    }
                },
                {
                    "type": "text", 
                    "text": textContent
                }
            ];

            // GLM-4V-Flash只使用user消息，不需要system消息（参照Python示例）
            // gpt-4o-mini使用标准的OpenAI格式，支持system消息
            if (optimalModel === 'GLM-4V-Flash') {
                messages = [
                    {
                        "role": "user",
                        "content": userContent
                    }
                ];
            } else if (optimalModel === 'gpt-4o-mini') {
                // gpt-4o-mini使用标准格式，先添加system消息
                messages = [
                    {
                        "role": "system",
                        "content": `${currentRoleData.systemPrompt}\n\n重要提醒：你必须严格按照上述角色设定进行对话，始终保持角色的语言风格、性格特点和称呼习惯。`
                    },
                    {
                        "role": "user",
                        "content": userContent
                    }
                ];
            }
        } else {
            // 普通文本对话，保留角色设定
            const enhancedSystemPrompt = `${currentRoleData.systemPrompt}

重要提醒：你必须严格按照上述角色设定进行对话，始终保持角色的语言风格、性格特点和称呼习惯。不要说你是"人工智能助手"或类似的话，你就是这个角色本身。请完全融入角色，用角色的口吻和身份回答所有问题。`;

            messages = [
                {
                    role: "system",
                    content: enhancedSystemPrompt
                }
            ];            // 添加对话历史（按时间顺序，如果启用了历史功能）
            if (this.settings.historyEnabled) {
                console.log('对话历史已启用，当前历史数量:', this.conversationHistory.length);
                this.conversationHistory.forEach((item, index) => {
                    console.log(`添加历史对话 ${index + 1}: 问题="${item.question}", 答案="${item.answer.substring(0, 100)}..."`);
                    messages.push({ role: "user", content: item.question });
                    messages.push({ role: "assistant", content: item.answer });
                });
            } else {
                console.log('对话历史已禁用，不添加历史记录');
            }

            // 添加当前问题
            let currentQuery = query;
            
            // 如果有搜索结果，将其添加到查询中
            if (searchResults && searchResults.length > 0) {
                console.log('包含', searchResults.length, '个搜索结果到AI查询中');
                
                let searchContext = '\n\n=== 网络搜索结果 ===\n';
                searchContext += '以下是关于用户问题的最新网络搜索结果，请结合这些信息回答用户的问题：\n\n';
                
                searchResults.forEach((result, index) => {
                    searchContext += `${index + 1}. 标题: ${result.title}\n`;
                    searchContext += `   链接: ${result.url}\n`;
                    searchContext += `   内容: ${result.description}\n\n`;
                });
                
                searchContext += '=== 搜索结果结束 ===\n\n';
                currentQuery = searchContext + '用户问题：' + query;
            }

            // 如果有文本文件，添加到文本内容中
            if (textFiles.length > 0) {
                let fileContents = '\n\n=== 用户上传的文件内容 ===\n';
                textFiles.forEach((file, index) => {
                    fileContents += `\n--- 文件 ${index + 1}: ${file.name} ---\n`;
                    fileContents += file.content + '\n';
                });
                fileContents += '\n=== 文件内容结束 ===\n\n';
                currentQuery = fileContents + '用户问题：' + query;
            }

            // 添加用户消息
            messages.push({ 
                role: "user", 
                content: currentQuery 
            });
        }
        
        // 如果历史过长，只保留最近的对话
        if (messages.length > 20) {
            const systemMessage = messages[0];
            const recentMessages = messages.slice(-19);
            messages.splice(0, messages.length, systemMessage, ...recentMessages);
            console.log('历史过长，截取到', messages.length, '条消息');
        }        // 构建API请求体
        const requestBody = {
            "model": optimalModel,
            "messages": messages,
            "temperature": 0.7
        };

        // 根据模型调整参数
        if (optimalModel === 'GLM-4V-Flash') {
            // GLM-4V使用较小的max_tokens
            requestBody.max_tokens = 1000;
        } else if (optimalModel === 'gpt-4o-mini') {
            // gpt-4o-mini使用中等的max_tokens，支持多模态
            requestBody.max_tokens = 4096;
        } else {
            // 其他模型使用较大的max_tokens
            requestBody.max_tokens = 5500;
        }
          console.log('=== API请求体详情 ===');
        console.log('模型:', requestBody.model);
        console.log('消息数量:', requestBody.messages.length);
        console.log('完整请求体:', JSON.stringify(requestBody, null, 2));
        console.log('=== 开始发送API请求 ===');

        // GLM-4V模型可能不支持stream，需要特殊处理
        if (optimalModel === 'GLM-4V-Flash') {
            console.log('GLM-4V模型，禁用stream模式');
            // GLM-4V不使用stream模式
        } else {
            // 其他模型（包括gpt-4o-mini）添加stream参数开启流式传输
            requestBody.stream = true;
        }
          // 根据模型选择正确的API地址和密钥
          let apiUrl = this.apiBaseUrl;
          let apiKey = this.apiKey;
          
          // 如果是gpt-4o-mini模型，使用free.v36.cm的API
          if (optimalModel === 'gpt-4o-mini') {
              apiUrl = this.apiBaseUrl; // 默认是gpt-4o-mini的API地址
              apiKey = this.apiKey; // 默认是gpt-4o-mini的API密钥
              console.log('使用gpt-4o-mini模型API:', apiUrl);
          } else {
              // 其他模型使用paratera的API
              apiUrl = this.parateraApiBaseUrl;
              apiKey = this.parateraApiKey;
              console.log(`使用${optimalModel}模型API:`, apiUrl);
          }
          
          const response = await fetch(`${apiUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': requestBody.stream ? 'text/event-stream' : 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            // 获取错误详情
            const errorText = await response.text();
            console.error('API请求失败详情:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`API请求失败: ${response.status} - ${errorText}`);
        }

        // 根据是否使用stream返回不同的响应格式
        if (requestBody.stream) {
            // 流式响应
            return {
                success: true,
                stream: response.body,
                reader: response.body.getReader()
            };
        } else {
            // 非流式响应（GLM-4V）
            const data = await response.json();
            return {
                success: true,
                data: data,
                isNonStream: true
            };
        }
    }async performWebSearch(query) {        
        try {
            // 使用外部域名访问CORS代理服务器
            const searchUrl = `http://chengyuxuan.top:3001/search?q=${encodeURIComponent(query)}&format=json`;
            console.log('发起搜索请求（通过CORS代理），URL:', searchUrl);
            
            // 设置较短的超时时间
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
            
            const response = await fetch(searchUrl, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; AI-Search-Bot/1.0)'
                }
            });

            clearTimeout(timeoutId);
            console.log('搜索API响应状态:', response.status, response.statusText);if (!response.ok) {
                console.warn(`SearxNG搜索API返回错误状态: ${response.status}`);
                return []; // 返回空数组而不是备用结果
            }            // 解析JSON响应
            const text = await response.text();
            console.log('API响应原始内容长度:', text.length, '字符');
            console.log('API响应前500字符:', text.substring(0, 500));
            
            let data;
            try {
                data = JSON.parse(text);
                console.log('JSON解析成功，数据类型:', typeof data);
                console.log('JSON数据结构预览:', JSON.stringify(data, null, 2).substring(0, 1000));            } catch (parseError) {
                console.error('JSON解析失败:', parseError);
                console.error('响应内容不是有效的JSON，完整内容:', text);
                return [];
            }
              // 更灵活地检查返回的数据结构
            let results = [];
            
            // SearxNG的数据结构检查 - 忽略 number_of_results，直接检查 results 数组
            if (data && data.results && Array.isArray(data.results)) {
                results = data.results;
                console.log('从 data.results 获取SearxNG结果，数量:', results.length);
            } else if (data && Array.isArray(data)) {
                results = data;
                console.log('直接从 data 获取结果（数组格式），数量:', results.length);
            } else if (data && data.data && Array.isArray(data.data)) {
                results = data.data;
                console.log('从 data.data 获取结果，数量:', results.length);
            } else if (data && data.items && Array.isArray(data.items)) {
                results = data.items;
                console.log('从 data.items 获取结果，数量:', results.length);
            } else {
                console.warn('未找到有效的搜索结果数组，数据结构:', data);
                return [];
            }
            
            // 特别处理：即使 number_of_results 为 0，如果 results 数组有内容，仍然处理
            if (results.length > 0) {
                console.log('找到', results.length, '个搜索结果（忽略 number_of_results 字段）');
                console.log('前3个结果预览:', results.slice(0, 3));
                
                const processedResults = results.slice(0, 8).map((result, index) => {
                    console.log(`处理结果 ${index + 1}:`, {
                        title: result.title,
                        url: result.url,
                        content: result.content ? result.content.substring(0, 100) + '...' : '无内容'
                    });
                    
                    // SearxNG结果字段映射
                    const title = result.title || result.name || result.heading || '无标题';
                    const url = result.url || result.link || result.href || '#';
                    const description = result.content || result.description || result.snippet ||
                                      result.summary || result.excerpt || '暂无描述';
                    
                    const processed = { title, url, description };
                    console.log(`处理后结果 ${index + 1}:`, processed);
                    return processed;
                });
                console.log('最终处理后的结果数组:', processedResults);
                return processedResults;
            } else {
                console.warn('搜索结果数组为空');
                return [];
            }        } catch (error) {
            console.error('=== 搜索API调用详细错误信息 ===');
            console.error('错误类型:', error.name);
            console.error('错误消息:', error.message);
            console.error('错误堆栈:', error.stack);
            
            // 记录更多上下文信息
            console.error('搜索查询:', query);
            console.error('请求URL:', `http://chengyuxuan.top:3001/search?q=${encodeURIComponent(query)}&format=json`);
            
            if (error.name === 'AbortError') {
                console.warn('搜索请求超时');
                return []; // 超时时返回空数组，不显示错误信息
            } else if (error.name === 'TypeError' && error.message.includes('CORS')) {
                console.error('CORS跨域错误 - 服务器未设置正确的CORS头');
                console.error('解决方案: 需要服务器在响应头中添加 Access-Control-Allow-Origin');
                return []; // CORS错误时返回空数组
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                console.error('网络请求失败 - 可能的原因：');
                console.error('1. CORS代理服务器未启动 - 请运行 start-cors-proxy.sh');
                console.error('2. 网络连接问题');
                console.error('3. SearxNG服务器不可访问');
                console.error('');
                console.error('解决方案: 请先启动CORS代理服务器');
                console.error('运行文件: start-cors-proxy.sh');
                console.error('代理地址: http://chengyuxuan.top:3001');
                
                // 如果是网络连接失败，返回错误提示
                return [{
                    title: '🚨 代理服务器未启动',
                    url: '#',
                    description: '搜索功能需要启动CORS代理服务器。请运行 start-cors-proxy.sh 文件，然后重试搜索。代理服务器地址：http://chengyuxuan.top:3001'
                }];
            } else {
                console.error('其他类型的网络错误:', error);
                // 对于其他错误，返回空数组而不是错误信息
                return [];
            }
              return []; // 网络错误时也返回空数组
        }
    }    addMessage(content, type, isError = false) {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        // 根据消息类型和当前角色设置头像
        if (type === 'user') {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        } else {
            // AI消息：根据当前选择的角色显示头像
            const currentRoleData = this.roles && this.roles[this.currentRole] ? this.roles[this.currentRole] : this.roles && this.roles['default'];
            console.log('AI消息头像设置 - 当前角色:', this.currentRole, '角色名称:', currentRoleData ? currentRoleData.name : '未知');
            
            if (currentRoleData && currentRoleData.avatar) {
                avatar.innerHTML = `<img src="${currentRoleData.avatar}" alt="${currentRoleData.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                console.log('使用角色头像:', currentRoleData.avatar);
            } else {
                avatar.innerHTML = '<i class="fas fa-robot"></i>';
                console.log('使用默认机器人头像');
            }
        }
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        if (isError) {
            bubble.style.background = 'linear-gradient(135deg, var(--danger-color), #ff6b6b)';
        }
        
        // 对AI消息使用Markdown渲染
        if (type === 'ai' || type === 'bot') {
            bubble.innerHTML = this.renderMarkdown(content);
            // 为AI消息绑定think容器事件监听器
            if (bubble.innerHTML.includes('think-container')) {
                this.bindThinkEventListeners(bubble);
            }
        } else {
            const contentDiv = document.createElement('div');
            contentDiv.textContent = content;
            bubble.appendChild(contentDiv);
        }
        
        // 添加复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制';
        copyBtn.onclick = () => this.copyMessage(content, copyBtn);
        bubble.appendChild(copyBtn);
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        
        message.appendChild(avatar);
        message.appendChild(bubble);
        bubble.appendChild(time);
        
        this.messagesContainer.appendChild(message);
        
        // 滚动到底部
        this.scrollToBottom();
        
        return message;
    }

    addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message ai typing-indicator-message';
        
        // 根据当前角色设置头像
        const currentRoleData = this.roles && this.roles[this.currentRole] ? this.roles[this.currentRole] : this.roles['default'];
        let avatarHtml = '<i class="fas fa-robot"></i>';
        if (currentRoleData && currentRoleData.avatar) {
            avatarHtml = `<img src="${currentRoleData.avatar}" alt="${currentRoleData.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
        
        indicator.innerHTML = `
            <div class="message-avatar">
                ${avatarHtml}
            </div>
            <div class="message-bubble typing-indicator">
                <span>AI正在思考</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
          return indicator;
    }

    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }

    displaySearchResults(results) {
        console.log('=== displaySearchResults 调试开始 ===');
        console.log('displaySearchResults 被调用，参数:', results);
        console.log('this.searchResults 元素:', this.searchResults);
        console.log('this.resultsContainer 元素:', this.resultsContainer);
          // 检查DOM元素是否存在
        if (!this.searchResults) {
            console.error('搜索结果容器 (searchResults) 未找到！');
            console.error('尝试重新获取 searchResults 元素...');
            this.searchResults = document.getElementById('searchResults');
            if (!this.searchResults) {
                console.error('重新获取失败，搜索结果无法显示');
                return;
            }
        }
        
        if (!this.resultsContainer) {
            console.error('搜索结果内容容器 (resultsContainer) 未找到！');
            console.error('尝试重新获取 resultsContainer 元素...');
            this.resultsContainer = document.getElementById('resultsContainer');
            if (!this.resultsContainer) {
                console.error('重新获取失败，搜索结果无法显示');
                return;
            }
        }
        
        if (!results || results.length === 0) {
            console.log('没有搜索结果，隐藏搜索结果区域');
            this.searchResults.style.display = 'none';
            return;
        }

        console.log('准备显示', results.length, '个搜索结果');
        console.log('当前 resultsContainer.innerHTML:', this.resultsContainer.innerHTML);
        
        // 清空之前的结果
        this.resultsContainer.innerHTML = '';
        console.log('已清空 resultsContainer');
        
        results.forEach((result, index) => {
            console.log(`处理搜索结果 ${index + 1}:`, result);
            
            // 验证结果数据
            if (!result.title && !result.url && !result.description) {
                console.warn(`搜索结果 ${index + 1} 数据无效，跳过`);
                return;
            }
            
            const resultItem = document.createElement('a');
            resultItem.className = 'result-item';
            resultItem.href = result.url || '#';
            resultItem.target = '_blank';
            
            const safeTitle = (result.title || '无标题').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeUrl = (result.url || '#').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const safeDescription = (result.description || '暂无描述').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            resultItem.innerHTML = `
                <div class="result-title">${safeTitle}</div>
                <div class="result-url">${safeUrl}</div>
                <div class="result-description">${safeDescription}</div>
            `;
            
            console.log(`创建的结果项 ${index + 1}:`, resultItem);
            this.resultsContainer.appendChild(resultItem);
            console.log(`已添加结果项 ${index + 1} 到容器`);
        });
        
        console.log('最终 resultsContainer.children.length:', this.resultsContainer.children.length);
        console.log('显示搜索结果区域');
        this.searchResults.style.display = 'block';
        console.log('searchResults.style.display 设置为:', this.searchResults.style.display);
        
        // 验证元素是否真的显示了
        setTimeout(() => {
            console.log('1秒后检查：');        console.log('searchResults 计算样式 display:', window.getComputedStyle(this.searchResults).display);
        console.log('searchResults 可见性:', this.searchResults.offsetHeight > 0, this.searchResults.offsetWidth > 0);
        console.log('resultsContainer 子元素数量:', this.resultsContainer.children.length);
        
        // 检查CSS样式加载
        const computedStyle = window.getComputedStyle(this.searchResults);
        console.log('searchResults 完整计算样式:', {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            height: computedStyle.height,
            width: computedStyle.width,
            marginTop: computedStyle.marginTop,
            padding: computedStyle.padding,
            background: computedStyle.background,
            position: computedStyle.position,
            zIndex: computedStyle.zIndex
        });
        
        // 检查父元素
        console.log('searchResults 父元素:', this.searchResults.parentElement);
        console.log('searchResults 在DOM中的位置:', this.searchResults.getBoundingClientRect());
        }, 1000);
        
        // 滚动到搜索结果
        setTimeout(() => {
            if (this.searchResults.offsetHeight > 0) {
                this.searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
                console.log('已滚动到搜索结果区域');
            } else {
                console.warn('搜索结果区域高度为0，未滚动');
            }
        }, 300);
        
        console.log('=== displaySearchResults 调试结束 ===');
    }    scrollToBottom() {
        setTimeout(() => {
            const lastMessage = this.messagesContainer.lastElementChild;
            if (lastMessage) {
                lastMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }

    saveConversationHistory(question, answer) {
        // 检查是否启用了对话历史功能
        if (!this.settings.historyEnabled) {
            console.log('对话历史功能已禁用，不保存对话');
            return;
        }
        
        console.log('保存对话历史 - 问题:', question);
        console.log('保存对话历史 - 答案:', answer);
        
        this.conversationHistory.push({ question, answer, timestamp: Date.now() });
        
        // 只保留最近10条对话
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
        
        console.log('当前对话历史长度:', this.conversationHistory.length);
        console.log('完整对话历史:', this.conversationHistory);
        
        // 保存到localStorage
        try {
            localStorage.setItem('ai_search_history', JSON.stringify(this.conversationHistory));
            console.log('对话历史已保存到localStorage');
        } catch (e) {
            console.warn('无法保存对话历史:', e);
        }
    }    loadConversationHistory() {
        try {
            const history = localStorage.getItem('ai_search_history');
            if (history) {
                this.conversationHistory = JSON.parse(history);
                // 如果有历史对话，恢复显示并切换到聊天模式
                if (this.conversationHistory.length > 0) {
                    this.restoreHistoryMessages();
                    this.switchToChatMode();
                }
            }
        } catch (e) {
            console.warn('无法加载对话历史:', e);
            this.conversationHistory = [];
        }
    }    // 恢复历史消息的显示
    restoreHistoryMessages() {
        this.conversationHistory.forEach(item => {
            if (item.question) {
                this.addMessage(item.question, 'user');
            }
            if (item.answer) {
                this.addMessage(item.answer, 'ai');
            }
        });
        console.log(`已恢复 ${this.conversationHistory.length} 条历史对话`);    }clearHistory() {
        this.conversationHistory = [];
        this.messagesContainer.innerHTML = '';
        this.searchResults.style.display = 'none';
        
        // 恢复到初始布局
        this.resetToInitialMode();
        
        // 强制恢复页面状态
        document.body.style.overflow = '';
        
        try {
            localStorage.removeItem('ai_search_history');
        } catch (e) {
            console.warn('无法清除对话历史:', e);
        }
        this.showNotification('对话历史已清除', 'success');
    }// 恢复到初始模式
    resetToInitialMode() {
        const aiSearchSection = document.querySelector('.ai-search-section');
        const searchArea = document.querySelector('.search-area');
        const chatContainer = document.querySelector('.chat-container');
        const settingsBtn = document.querySelector('.settings-btn');
        const clearHistoryBtn = document.querySelector('.clear-history-btn');
        const collapseBtn = document.querySelector('.collapse-btn');
        const chatSearchContainer = document.querySelector('.chat-search-container');

        if (aiSearchSection) aiSearchSection.classList.remove('chat-mode');
        if (searchArea) searchArea.classList.remove('fixed-bottom');
        if (chatContainer) chatContainer.classList.remove('chat-active');
        if (settingsBtn) settingsBtn.classList.remove('chat-mode');
        if (clearHistoryBtn) clearHistoryBtn.classList.remove('chat-mode');
        if (collapseBtn) collapseBtn.classList.remove('chat-mode');
        
        // 隐藏聊天模式搜索框
        if (chatSearchContainer) {
            chatSearchContainer.style.display = 'none';
        }

        console.log('已恢复到初始模式');
    }

    setupSettings() {
        // 创建设置按钮
        this.createSettingsButton();
        
        // 创建搜索框折叠按钮
        this.createCollapseButton();
        
        // 创建设置弹窗
        this.createSettingsModal();
        
        // 设置事件监听器
        this.setupSettingsEventListeners();
    }
      createSettingsButton() {
        this.settingsBtn = document.createElement('button');
        this.settingsBtn.className = 'settings-btn';
        this.settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
        this.settingsBtn.title = '搜索设置';
        
        document.body.appendChild(this.settingsBtn);
        console.log('设置按钮已创建');
    }
    
    createCollapseButton() {
        this.collapseBtn = document.createElement('button');
        this.collapseBtn.className = 'collapse-btn';
        this.collapseBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
        this.collapseBtn.title = '折叠/展开搜索框';
        
        // 初始化折叠状态
        this.isSearchAreaCollapsed = false;
        
        document.body.appendChild(this.collapseBtn);
        console.log('折叠按钮已创建');
    }
    
    createSettingsModal() {
        // 创建弹窗容器
        this.settingsModal = document.createElement('div');
        this.settingsModal.className = 'settings-modal';
        
        // 创建弹窗内容
        this.settingsModal.innerHTML = `
            <div class="settings-modal-content">
                <div class="settings-modal-header">
                    <div class="settings-modal-title">
                        <i class="fas fa-cog"></i>
                        <span>搜索设置</span>
                    </div>
                    <button class="settings-close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">
                            <i class="fas fa-globe"></i>
                            <span>联网搜索</span>
                        </div>
                        <div class="setting-description">启用后会搜索互联网内容，提供更丰富的信息</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="webSearchToggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">
                            <i class="fas fa-history"></i>
                            <span>记住对话历史</span>
                        </div>
                        <div class="setting-description">AI会记住之前的对话内容，提供连续的对话体验</div>
                    </div>
                    <div class="setting-control">
                        <label class="toggle-switch">
                            <input type="checkbox" id="historyToggle" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.settingsModal);
        
        // 获取弹窗内的元素引用
        this.webSearchToggle = document.getElementById('webSearchToggle');
        this.historyToggle = document.getElementById('historyToggle');
        
        console.log('设置弹窗已创建');
    }
    
    setupSettingsEventListeners() {
        // 设置按钮点击事件
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => {
                this.showSettingsModal();
            });
        }
        
        // 折叠按钮点击事件
        if (this.collapseBtn) {
            this.collapseBtn.addEventListener('click', () => {
                this.toggleSearchArea();
            });
        }
        
        // 关闭按钮事件
        const closeBtn = this.settingsModal.querySelector('.settings-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideSettingsModal();
            });
        }
        
        // 点击弹窗背景关闭
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.hideSettingsModal();
            }
        });
        
        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsModal.classList.contains('show')) {
                this.hideSettingsModal();
            }
        });
        
        // 联网搜索开关
        if (this.webSearchToggle) {
            this.webSearchToggle.addEventListener('change', (e) => {
                this.settings.webSearchEnabled = e.target.checked;
                this.saveSettings();
                console.log('联网搜索设置:', this.settings.webSearchEnabled ? '已启用' : '已禁用');
            });
        }
        
        // 对话历史开关
        if (this.historyToggle) {
            this.historyToggle.addEventListener('change', (e) => {
                this.settings.historyEnabled = e.target.checked;
                this.saveSettings();
                console.log('对话历史设置:', this.settings.historyEnabled);
                
                // 如果禁用历史，清除当前历史
                if (!this.settings.historyEnabled) {
                    this.conversationHistory = [];
                    try {
                        localStorage.removeItem('ai_search_history');
                        console.log('对话历史已清除');
                    } catch (e) {
                        console.warn('无法清除对话历史:', e);
                    }
                }
            });
        }
    }
    
    showSettingsModal() {
        if (this.settingsModal) {
            this.settingsModal.classList.add('show');
            document.body.style.overflow = 'hidden'; // 防止背景滚动
        }
    }
      hideSettingsModal() {
        if (this.settingsModal) {
            this.settingsModal.classList.remove('show');
            document.body.style.overflow = ''; // 恢复滚动
        }
    }
      toggleSearchArea() {
        const searchArea = document.querySelector('.search-area');
        if (!searchArea) {
            console.warn('搜索区域元素未找到');
            return;
        }
        
        this.isSearchAreaCollapsed = !this.isSearchAreaCollapsed;
        
        if (this.isSearchAreaCollapsed) {
            // 折叠搜索框
            searchArea.classList.add('collapsed');
            this.collapseBtn.classList.add('collapsed');
            this.collapseBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
            this.collapseBtn.title = '展开搜索框';
            this.showNotification('搜索框已折叠', 'info', 2000);
        } else {
            // 展开搜索框
            searchArea.classList.remove('collapsed');
            this.collapseBtn.classList.remove('collapsed');
            this.collapseBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            this.collapseBtn.title = '折叠搜索框';
            this.showNotification('搜索框已展开', 'info', 2000);
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('ai_search_settings', JSON.stringify(this.settings));
            console.log('设置已保存:', this.settings);
        } catch (e) {
            console.warn('无法保存设置:', e);
        }
    }
    
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('ai_search_settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
                
                // 更新UI状态
                if (this.webSearchToggle) {
                    this.webSearchToggle.checked = this.settings.webSearchEnabled;
                }
                if (this.historyToggle) {
                    this.historyToggle.checked = this.settings.historyEnabled;
                }
                
                console.log('设置已加载:', this.settings);
            }
        } catch (e) {
            console.warn('无法加载设置:', e);
        }    }
    
    // 设置模型选择器
    setupModelSelector() {
        this.modelSelector = document.getElementById('modelSelect');
        if (!this.modelSelector) {
            console.warn('模型选择器未找到');
            return;
        }

        // 设置选项的title属性（鼠标悬停提示）
        this.modelSelector.querySelectorAll('option').forEach(option => {
            const modelName = option.value;
            const config = this.modelConfigs[modelName];
            if (config) {
                option.title = config.description;
            }
        });

        // 模型切换事件
        this.modelSelector.addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            console.log('模型已切换为:', this.currentModel);
            this.showNotification(`已切换到 ${this.currentModel}`, 'success', 3000);
        });

        console.log('模型选择器已初始化，当前模型:', this.currentModel);
    }    // 智能模型切换
    switchToOptimalModel() {
        console.log('=== switchToOptimalModel 开始 ===');
        console.log('当前模型 (this.currentModel):', this.currentModel);
        console.log('深度搜索状态 (this.deepSearchActive):', this.deepSearchActive);
        console.log('AI绘图状态 (this.aiDrawActive):', this.aiDrawActive);
        
        let targetModel = this.currentModel;

        // 检查是否上传了图片
        const hasImages = this.uploadedFileContents.some(file => 
            file.type.startsWith('image/'));
        
        console.log('是否有图片文件 (hasImages):', hasImages);
        
        if (hasImages) {
            // 优先选择支持多模态的模型
            if (this.currentModel === 'gpt-4o-mini') {
                targetModel = 'gpt-4o-mini'; // gpt-4o-mini支持多模态
                console.log('检测到图片上传，继续使用多模态模型 gpt-4o-mini');
            } else {
                targetModel = 'GLM-4V-Flash';
                console.log('检测到图片上传，自动切换到多模态模型 GLM-4V-Flash');
            }
        }
        // 检查是否开启深度思考
        else if (this.deepSearchActive) {
            targetModel = 'GLM-Z1-Flash';
            console.log('检测到深度思考模式，自动切换到深度思考模型');
        }
        // 检查是否开启AI绘图
        else if (this.aiDrawActive) {
            targetModel = 'GLM-CogView3-Flash';
            console.log('检测到AI绘图模式，自动切换到绘图模型');
        }

        console.log('目标模型 (targetModel):', targetModel);

        if (targetModel !== this.currentModel) {
            console.log('模型需要切换，从', this.currentModel, '到', targetModel);
            this.currentModel = targetModel;
            if (this.modelSelector) {
                this.modelSelector.value = targetModel;
                console.log('UI模型选择器已更新为:', this.modelSelector.value);
            }
            this.showNotification(`智能切换到 ${targetModel}`, 'info', 3000);
        } else {
            console.log('模型无需切换，保持当前模型:', targetModel);
        }

        console.log('=== switchToOptimalModel 结束，返回模型:', targetModel, ' ===');
        return targetModel;
    }
    
    setupFileUpload() {
        if (!this.fileUploadInput) {
            console.warn('文件上传输入框未找到');
            return;
        }

        // 文件选择事件
        this.fileUploadInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // 清空文件按钮事件
        if (this.clearFilesBtn) {
            this.clearFilesBtn.addEventListener('click', () => {
                this.clearAllFiles();
            });
        }

        // 拖拽上传功能
        const fileUploadArea = document.querySelector('.file-upload-area');
        if (fileUploadArea) {
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.classList.add('drag-over');
            });

            fileUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                if (!fileUploadArea.contains(e.relatedTarget)) {
                    fileUploadArea.classList.remove('drag-over');
                }
            });

            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.classList.remove('drag-over');
                this.handleFileSelect(e.dataTransfer.files);
            });
        }

        console.log('文件上传功能已初始化');
    }    async handleFileSelect(files) {
        if (!files || files.length === 0) return;

        console.log('选择了', files.length, '个文件');

        let hasNewImages = false;
        for (let file of files) {
            if (this.isValidFileType(file)) {
                await this.processFile(file);
                // 检查是否有新上传的图片
                if (file.type.startsWith('image/')) {
                    hasNewImages = true;
                }
            } else {
                this.showFileError(file.name, '不支持的文件格式');
            }
        }

        this.updateFileListDisplay();
        
        // 如果上传了新图片，自动切换到多模态模型
        if (hasNewImages) {
            this.switchToOptimalModel();
        }
    }

    isValidFileType(file) {
        const allowedTypes = [
            'text/markdown',
            'text/plain',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'image/png',
            'image/jpeg',
            'image/jpg'
        ];

        const allowedExtensions = [
            '.md', '.markdown', '.txt', '.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg'
        ];

        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
          return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
    }

    async processFile(file) {
        const fileId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const fileItem = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'processing',
            content: null,
            error: null
        };

        this.uploadedFileContents.push(fileItem);
        this.updateFileListDisplay();

        try {
            let content = '';
            
            if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.name.endsWith('.txt')) {
                // 文本文件直接读取
                content = await this.readTextFile(file);
                console.log('文本文件读取完成：', file.name, '内容长度：', content.length);            } else if (file.type === 'application/pdf') {
                // PDF文件需要特殊处理（这里简化为提示用户）
                content = `[PDF文件：${file.name}，大小：${this.formatFileSize(file.size)}]
注意：PDF内容提取功能正在开发中，目前AI只能看到文件基本信息。
建议：您可以描述PDF的主要内容，AI会根据您的描述来理解文档。`;            } else if (file.type.startsWith('image/')) {
                // 图片文件：首先读取为base64，然后上传到服务器
                const base64Content = await this.readImageFile(file);
                console.log('图片文件读取完成：', file.name, 'base64长度：', base64Content.length);
                
                // 上传图片到服务器
                try {
                    const uploadResult = await this.uploadImageToServer(base64Content, file.name);
                    if (uploadResult.success) {
                        content = uploadResult.url; // 使用服务器URL而不是base64
                        console.log('图片上传到服务器成功：', uploadResult.url);
                    } else {
                        throw new Error('图片上传失败：' + uploadResult.error);
                    }
                } catch (uploadError) {
                    console.error('图片上传失败，使用base64作为备选：', uploadError);
                    content = base64Content; // 备选方案：使用base64
                }
            } else {
                // 其他文件类型
                content = `[文件：${file.name}，类型：${file.type}，大小：${this.formatFileSize(file.size)}]
注意：此文件类型的内容提取功能正在开发中，目前AI只能看到文件基本信息。`;
            }

            // 更新文件状态
            fileItem.content = content;
            fileItem.status = 'completed';
            
            console.log('文件处理完成：', file.name);
            
            // 如果是文本文件且内容很长，提供摘要
            if (content.length > 5000) {
                console.log('文件内容较长，建议用户在提问时指明具体想了解的部分');
            }
              } catch (error) {
            console.error('文件处理失败：', error);
            fileItem.status = 'error';
            fileItem.error = error.message;
            this.showFileError(file.name, error.message);
        }

        this.updateFileListDisplay();    }

    // 上传图片到服务器
    async uploadImageToServer(base64Data, filename) {
        try {
            console.log('开始上传图片到服务器:', filename);
            
            const response = await fetch('http://chengyuxuan.top:3002/upload-photo-base64', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageData: base64Data,
                    filename: filename
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP错误 ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('图片上传结果:', result);
            
            return result;
        } catch (error) {
            console.error('图片上传到服务器失败:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    readImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // 返回完整的data URL（包含data:image/xxx;base64,前缀）
                resolve(e.target.result);
            };
            reader.onerror = (e) => reject(new Error('图片文件读取失败'));
            reader.readAsDataURL(file);
        });
    }

    updateFileListDisplay() {
        if (!this.fileList || !this.uploadedFiles) return;

        if (this.uploadedFileContents.length === 0) {
            this.uploadedFiles.style.display = 'none';
            return;
        }

        this.uploadedFiles.style.display = 'block';
        this.fileList.innerHTML = '';

        this.uploadedFileContents.forEach(fileItem => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            fileElement.innerHTML = `
                <div class="file-item-info">
                    <div class="file-item-icon">
                        <i class="${this.getFileIcon(fileItem.name)}"></i>
                    </div>
                    <div class="file-item-details">
                        <div class="file-item-name" title="${fileItem.name}">${fileItem.name}</div>
                        <div class="file-item-size">${this.formatFileSize(fileItem.size)}</div>
                    </div>
                </div>
                <div class="file-item-status ${fileItem.status}">${this.getStatusText(fileItem.status)}</div>
                <button class="remove-file-btn" onclick="window.aiSearch.removeFile('${fileItem.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            this.fileList.appendChild(fileElement);
        });
    }

    getFileIcon(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            'md': 'fab fa-markdown',
            'markdown': 'fab fa-markdown',
            'txt': 'fas fa-file-alt',
            'pdf': 'fas fa-file-pdf',
            'docx': 'fas fa-file-word',
            'doc': 'fas fa-file-word',
            'png': 'fas fa-file-image',
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image'
        };
        return iconMap[extension] || 'fas fa-file';
    }

    getStatusText(status) {
        const statusMap = {
            'processing': '处理中...',
            'completed': '已完成',
            'error': '错误'
        };
        return statusMap[status] || status;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(fileId) {
        this.uploadedFileContents = this.uploadedFileContents.filter(file => file.id !== fileId);
        this.updateFileListDisplay();
        console.log('文件已移除：', fileId);
    }

    clearAllFiles() {
        this.uploadedFileContents = [];
        this.updateFileListDisplay();
        if (this.fileUploadInput) {
            this.fileUploadInput.value = '';
        }
        console.log('所有文件已清空');    }

    showFileError(fileName, error) {
        // 显示错误通知
        this.showNotification(`文件 ${fileName} 上传失败：${error}`, 'error');
        console.error(`文件上传错误：${fileName} - ${error}`);
    }    getUploadedFilesSummary() {
        const completedFiles = this.uploadedFileContents.filter(file => file.status === 'completed');
        if (completedFiles.length === 0) return '';
        
        const imageFiles = completedFiles.filter(file => file.type.startsWith('image/'));
        const textFiles = completedFiles.filter(file => !file.type.startsWith('image/'));
        
        let summary = ' [包含 ';
        const parts = [];
        
        if (imageFiles.length > 0) {
            parts.push(`${imageFiles.length} 张图片`);
        }
        if (textFiles.length > 0) {
            parts.push(`${textFiles.length} 个文件`);
        }
        
        summary += parts.join('和') + `: ${completedFiles.map(f => f.name).join(', ')}]`;
        return summary;
    }

    // 复制消息内容
    copyMessage(content, button) {
        try {
            // 创建临时文本区域
            const textarea = document.createElement('textarea');
            textarea.value = content;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            // 更新按钮状态
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> 已复制';
            button.classList.add('copied');
            
            // 显示通知
            this.showNotification('内容已复制到剪贴板', 'success');
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);
        } catch (error) {
            console.error('复制失败:', error);
            this.showNotification('复制失败，请手动选择复制', 'error');
        }
    }
    
    // 复制代码块内容
    copyCode(codeId, button) {
        try {
            const codeElement = document.getElementById(codeId);
            const codeText = codeElement.querySelector('code').textContent;
            
            // 创建临时文本区域
            const textarea = document.createElement('textarea');
            textarea.value = codeText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            // 更新按钮状态
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> 已复制';
            button.classList.add('copied');
            
            // 显示通知
            this.showNotification('代码已复制到剪贴板', 'success');
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);
        } catch (error) {
            console.error('代码复制失败:', error);
            this.showNotification('代码复制失败，请手动选择复制', 'error');
        }
    }
    
    // 显示通知
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// 添加语音输入和清除历史的样式
const aiSearchStyles = document.createElement('style');
aiSearchStyles.textContent = `
    :root {
        --primary-color: #007bff;
        --secondary-color: #6c757d;
        --success-color: #28a745;
        --danger-color: #dc3545;
        --warning-color: #ffc107;
        --info-color: #17a2b8;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
        --transition-normal: 0.3s ease;
    }
    
    .voice-input-btn {
        position: absolute;
        right: 75px;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        color: var(--text-secondary);
        font-size: 1.1rem;
        cursor: pointer;
        transition: all var(--transition-normal);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .voice-input-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: var(--text-primary);
    }
    
    .voice-input-btn.listening {
        background: var(--danger-color);
        color: white;
        animation: voicePulse 1s ease-in-out infinite;
    }
      @keyframes voicePulse {
        0%, 100% { transform: translateY(-50%) scale(1); }
        50% { transform: translateY(-50%) scale(1.1); }
    }
    
    /* 流式消息光标动画 */
    .cursor {
        color: var(--primary-color);
        font-weight: bold;
        animation: blink 1s infinite;
    }
    
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }
    
    /* 移动端语音按钮调整 */
    @media (max-width: 768px) {
        .voice-input-btn {
            right: 65px;
            width: 40px;
            height: 40px;
            font-size: 1rem;
        }
    }
    
    /* 移动端光标调整 */
    @media (max-width: 768px) {
        .cursor {
            font-size: 0.9rem;
        }
    }
`;
document.head.appendChild(aiSearchStyles);

// 角色选择器样式
const roleSelectorStyles = document.createElement('style');
roleSelectorStyles.textContent = `
    .role-selector-container {
        margin-bottom: 20px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        overflow: hidden;
    }
    
    .role-selector-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        cursor: pointer;
        transition: all var(--transition-normal);
        user-select: none;
    }
    
    .role-selector-header:hover {
        background: rgba(255, 255, 255, 0.08);
    }
    
    .role-selector-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .role-selector-title i {
        color: var(--primary-color);
    }
    
    .role-selector-toggle {
        color: var(--text-secondary);
        transition: transform 0.3s ease;
    }
    
    .role-selector-content {
        transition: all 0.3s ease;
        overflow: hidden;
    }
    
    .role-selector-content.collapsed {
        max-height: 0;
        opacity: 0;
    }
    
    .role-selector-content:not(.collapsed) {
        max-height: 200px;
        opacity: 1;
        padding: 0 15px 15px 15px;
    }
    
    .role-selector {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .role-option {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px 8px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        transition: all var(--transition-normal);
        min-width: 80px;
        position: relative;
    }
    
    .role-option:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--primary-color);
        transform: translateY(-2px);
    }
    
    .role-option.active {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        border-color: var(--primary-color);
        color: white;
        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    }
    
    .role-option.active::after {
        content: '✓';
        position: absolute;
        top: -5px;
        right: -5px;
        width: 20px;
        height: 20px;
        background: var(--success-color);
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
    }
    
    .role-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        margin-bottom: 8px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
    }
    
    .role-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .role-avatar.default {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        font-size: 1.5rem;
    }
    
    .role-option.active .role-avatar {
        border-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }
    
    .role-name {
        font-size: 0.85rem;
        font-weight: 500;
        text-align: center;
        line-height: 1.2;
    }
    
    /* 移动端响应式 */
    @media (max-width: 768px) {
        .role-selector {
            justify-content: center;
        }
        
        .role-option {
            min-width: 70px;
            padding: 10px 6px;
        }
        
        .role-avatar {
            width: 40px;
            height: 40px;
        }
        
        .role-name {
            font-size: 0.8rem;
        }
    }
    
    @media (max-width: 480px) {
        .role-selector-header {
            padding: 12px;
        }
        
        .role-option {
            min-width: 60px;
            padding: 8px 4px;
        }
        
        .role-avatar {
            width: 36px;
            height: 36px;
        }
        
        .role-name {
            font-size: 0.75rem;
        }    }
`;
document.head.appendChild(roleSelectorStyles);

// 深度搜索样式
const deepSearchStyles = document.createElement('style');
deepSearchStyles.textContent = `
    /* 深度搜索按钮样式 */
    .deep-search-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: var(--text-secondary);
        font-size: 0.9rem;
        cursor: pointer;
        transition: all var(--transition-normal);
        white-space: nowrap;
    }
    
    .deep-search-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: var(--text-primary);
        border-color: var(--primary-color);
    }
    
    .deep-search-btn.active {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border-color: var(--primary-color);
        box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    }
    
    .deep-search-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }
    
    /* AI绘图按钮样式 */
    .ai-draw-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: var(--text-secondary);
        font-size: 0.9rem;
        cursor: pointer;
        transition: all var(--transition-normal);
        white-space: nowrap;
    }
    
    .ai-draw-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: var(--text-primary);
        border-color: var(--primary-color);
    }
    
    .ai-draw-btn.active {
        background: linear-gradient(135deg, #ff6b35, #f7931e);
        color: white;
        border-color: #ff6b35;
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
    }
    
    .ai-draw-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
    }
    
    /* 深度搜索进度指示器 */
    .deep-search-progress {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin: 15px 0;
        backdrop-filter: blur(10px);
    }
      .deep-search-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--primary-color);
    }
    
    .deep-search-header .header-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .progress-close-btn {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.2rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        opacity: 0.7;
    }
    
    .progress-close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
        opacity: 1;
    }
    
    .deep-search-steps {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .progress-step {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        transition: all var(--transition-normal);
    }
    
    .progress-step.active {
        background: rgba(0, 123, 255, 0.1);
        border-left: 4px solid var(--primary-color);
    }
    
    .progress-step.completed {
        background: rgba(40, 167, 69, 0.1);
        border-left: 4px solid var(--success-color);
    }
    
    .step-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        color: var(--text-secondary);
        font-size: 1.1rem;
    }
    
    .progress-step.active .step-icon {
        background: var(--primary-color);
        color: white;
        animation: pulse 1.5s infinite;
    }
    
    .progress-step.completed .step-icon {
        background: var(--success-color);
        color: white;
    }
    
    .step-text {
        flex: 1;
        font-weight: 500;
        color: var(--text-primary);
    }
    
    .step-status {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .progress-step.active .step-status {
        color: var(--primary-color);
        font-weight: 500;
    }
      .progress-step.completed .step-status {
        color: var(--success-color);
        font-weight: 500;
    }
    
    /* 可点击步骤样式 */
    .progress-step.clickable {
        cursor: pointer;
    }
    
    .progress-step.clickable:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateX(5px);
    }
    
    @keyframes pulse {
        0%, 100% { 
            transform: scale(1);
            opacity: 1;
        }
        50% { 
            transform: scale(1.1);
            opacity: 0.8;
        }
    }    /* 步骤结果弹窗样式 */
    .step-result-modal {
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        width: 90vw;
        max-width: 900px;
        max-height: 85vh;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .step-result-modal.show {
        opacity: 1;
        visibility: visible;
    }
    
    .step-result-modal-content {
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        width: 100%;
        height: auto;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        transform: scale(0.9);
        transition: transform 0.3s ease;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }
    
    .step-result-modal.show .step-result-modal-content {
        transform: scale(1);
    }
      .step-result-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 25px;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
        border-radius: 12px 12px 0 0;
    }
    
    .step-result-header h3 {
        margin: 0;
        color: #333333;
        font-size: 1.4rem;
        font-weight: 600;
    }
    
    .close-btn {
        background: none;
        border: none;
        color: #666666;
        font-size: 1.5rem;
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .close-btn:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #333333;
    }
      .step-result-body {
        padding: 25px;
        overflow-y: auto;
        flex: 1;
        color: #333333;
        line-height: 1.6;
        font-size: 14px;
        background: #ffffff;
        max-height: calc(85vh - 140px); /* 减去头部和底部的高度 */
    }
    
    /* 自定义滚动条样式 */
    .step-result-body::-webkit-scrollbar {
        width: 8px;
    }
    
    .step-result-body::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    .step-result-body::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 4px;
    }
    
    .step-result-body::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
      .step-result-body h1,
    .step-result-body h2,
    .step-result-body h3,
    .step-result-body h4,
    .step-result-body h5,
    .step-result-body h6 {
        color: #2c3e50;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
    }
    
    .step-result-body p {
        margin-bottom: 1em;
        color: #333333;
    }
    
    .step-result-body ul,
    .step-result-body ol {
        margin-bottom: 1em;
        padding-left: 1.5em;
    }
    
    .step-result-body li {
        margin-bottom: 0.5em;
        color: #333333;
    }
    
    .step-result-body strong {
        color: #2c3e50;
        font-weight: 600;
    }
    
    .step-result-body code {
        background: #f1f3f4;
        color: #d73a49;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 13px;
    }
    
    .step-result-footer {
        padding: 20px 25px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        background: #f8f9fa;
        border-radius: 0 0 12px 12px;
    }
      .step-result-footer .btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .step-result-footer .btn:hover {
        background: #0056b3;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }
      /* 移动端适配 */
    @media (max-width: 768px) {
        .step-result-modal {
            top: 20px;
            width: 95vw;
            max-height: 90vh;
        }
        
        .step-result-modal-content {
            max-height: 90vh;
        }
        
        .step-result-header {
            padding: 15px 20px;
        }
        
        .step-result-header h3 {
            font-size: 1.2rem;
        }
        
        .step-result-body {
            padding: 20px;
            font-size: 14px;
            max-height: calc(90vh - 140px);
        }
        
        .step-result-footer {
            padding: 15px 20px;
        }
    }
    
    /* 确保弹窗不会被其他元素覆盖 */
    .step-result-modal {
        z-index: 99999 !important;
    }
    }
    
    /* 移动端适配 */
    @media (max-width: 768px) {
        .deep-search-steps {
            gap: 10px;
        }
        
        .progress-step {
            padding: 10px;
            gap: 10px;
        }
        
        .step-icon {
            width: 32px;
            height: 32px;
            font-size: 1rem;
        }
        
        .step-text {
            font-size: 0.9rem;
        }
        
        .step-status {
            font-size: 0.8rem;
        }
    }
`;
document.head.appendChild(deepSearchStyles);

// 为测试暴露函数到全局
document.addEventListener('DOMContentLoaded', function() {
    if (window.aiSearch) {
        // 暴露测试函数
        window.testRoleFunction = () => window.aiSearch.testRoleFunction();
        window.testSimpleRole = () => window.aiSearch.testSimpleRoleCall();
        window.testWithQuestion = (question) => window.aiSearch.testSimpleRoleCall(question);
        
        console.log('测试函数已暴露:');
        console.log('- window.testRoleFunction() - 角色状态检查');
        console.log('- window.testSimpleRole() - 简化角色测试');
        console.log('- window.testWithQuestion(question) - 带问题的角色测试');
    }
});

// 导出
window.AISearchEngine = AISearchEngine;

// 确保复制功能全局可访问
if (typeof window !== 'undefined') {
    window.copyAIMessage = function(content, button) {
        if (window.aiSearch && window.aiSearch.copyMessage) {
            window.aiSearch.copyMessage(content, button);
        }
    };
      window.copyAICode = function(codeId, button) {
        if (window.aiSearch && window.aiSearch.copyCode) {
            window.aiSearch.copyCode(codeId, button);
        }
    };
}

// 设置AI绘图功能
AISearchEngine.prototype.setupAIDraw = function() {
    this.aiDrawBtn = document.getElementById('aiDrawBtn');
    if (!this.aiDrawBtn) {
        console.warn('AI绘图按钮未找到');
        return;
    }

    this.aiDrawBtn.addEventListener('click', () => {
        this.toggleAIDraw();
    });

    console.log('AI绘图功能已初始化');
};

// 切换AI绘图模式
AISearchEngine.prototype.toggleAIDraw = function() {
    this.aiDrawActive = !this.aiDrawActive;
    
    if (this.aiDrawActive) {
        // 开启AI绘图模式
        this.aiDrawBtn.classList.add('active');
        this.aiDrawBtn.innerHTML = '<i class="fas fa-palette"></i><span>AI绘图</span>';
        
        // 关闭深度搜索模式（互斥）
        if (this.deepSearchActive) {
            this.toggleDeepSearch();
        }
        
        // 禁用深度搜索按钮
        if (this.deepSearchBtn) {
            this.deepSearchBtn.disabled = true;
            this.deepSearchBtn.style.opacity = '0.5';
        }
        
        this.showNotification('AI绘图模式已开启', 'success', 3000);
    } else {
        // 关闭AI绘图模式
        this.aiDrawBtn.classList.remove('active');
        this.aiDrawBtn.innerHTML = '<i class="fas fa-palette"></i><span>AI绘图</span>';
        
        // 启用深度搜索按钮
        if (this.deepSearchBtn) {
            this.deepSearchBtn.disabled = false;
            this.deepSearchBtn.style.opacity = '1';
        }
        
        this.showNotification('AI绘图模式已关闭', 'info', 3000);
    }

    // 智能切换模型
    this.switchToOptimalModel();
};

// AI绘图API调用
AISearchEngine.prototype.callDrawAPI = async function(prompt) {
    // 使用paratera的API地址和密钥进行绘图
    const apiUrl = this.parateraApiBaseUrl + '/images/generations';
    const apiKey = this.parateraApiKey; // 绘图使用paratera的API密钥
    
    try {
        console.log('开始调用AI绘图API...', apiUrl);
        
        // 构建包含历史对话的增强提示词
        let enhancedPrompt = prompt;
        
        // 如果启用了历史功能并且有历史对话，整合历史对话上下文
        if (this.settings.historyEnabled && this.conversationHistory.length > 0) {
            console.log('正在整合历史对话上下文...');
            
            // 获取最近的3-5轮对话作为上下文
            const recentHistory = this.conversationHistory.slice(-3);
            let historyContext = '## 对话历史上下文:\n';
            
            recentHistory.forEach((item, index) => {
                if (item.question) {
                    historyContext += `用户${index + 1}: ${item.question}\n`;
                }
                if (item.answer) {
                    historyContext += `AI${index + 1}: ${item.answer.substring(0, 200)}...\n`; // 截取前200字符
                }
                historyContext += '\n';
            });
            
            // 构建增强的绘图提示词
            enhancedPrompt = `${historyContext}## 当前绘图需求:\n${prompt}\n\n请根据以上对话历史和当前需求，创作一幅符合上下文语境的图像。`;
            
            console.log('增强后的绘图提示词:', enhancedPrompt.substring(0, 300) + '...');
        }
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'GLM-CogView3-Flash',
                prompt: enhancedPrompt // 使用增强后的提示词
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('AI绘图API响应:', data);
        
        if (data.data && data.data.length > 0 && data.data[0].url) {
            return {
                success: true,
                imageUrl: data.data[0].url,
                prompt: prompt, // 返回原始提示词用于显示
                enhancedPrompt: enhancedPrompt // 保存增强提示词用于调试
            };
        } else {
            throw new Error('API返回格式错误');
        }
        
    } catch (error) {
        console.error('AI绘图API调用失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// 创建AI绘图结果展示
AISearchEngine.prototype.createDrawResultElement = function(result) {
    const drawResultHTML = `
        <div class="ai-draw-result">
            <div class="ai-draw-result-header">
                <div class="ai-draw-result-title">
                    <i class="fas fa-palette"></i>
                    AI绘图结果
                </div>
            </div>
            
            <div class="ai-draw-image-container">
                <img class="ai-draw-image" src="${result.imageUrl}" alt="AI生成的图片" loading="lazy">
            </div>
              <div class="ai-draw-actions">
                <a class="ai-draw-action-btn ai-draw-download-btn" href="${result.imageUrl}" download="ai-generated-image.png">
                    <i class="fas fa-download"></i>
                    下载
                </a>
                <button class="ai-draw-action-btn ai-draw-regenerate-btn" 
                        data-prompt="${result.prompt}"
                        onclick="regenerateImage('${result.prompt}')">
                    <i class="fas fa-redo"></i>
                    重新生成
                </button>
            </div>
        </div>
    `;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = drawResultHTML;
    const element = tempDiv.firstElementChild;
    
    // 绑定重新生成按钮事件
    const regenerateBtn = element.querySelector('.ai-draw-regenerate-btn');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const prompt = regenerateBtn.getAttribute('data-prompt');
            console.log('事件监听器：重新生成按钮被点击，提示词:', prompt);
            this.regenerateImage(prompt);
        });
    }
    
    return element;
};

// 重新生成图片
AISearchEngine.prototype.regenerateImage = async function(prompt) {
    try {
        this.showNotification('正在重新生成图片...', 'info');
        
        const result = await this.callDrawAPI(prompt);
        
        if (result.success) {
            // 找到最后一个绘图结果并替换
            const lastDrawResult = this.messagesContainer.querySelector('.ai-draw-result:last-of-type');
            if (lastDrawResult) {
                const newDrawResult = this.createDrawResultElement(result);
                lastDrawResult.parentNode.replaceChild(newDrawResult, lastDrawResult);
            }
            
            this.showNotification('图片重新生成完成', 'success');
        } else {
            this.showNotification(`重新生成失败: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('重新生成图片失败:', error);
        this.showNotification('重新生成失败', 'error');
    }
};

// 处理流式响应
AISearchEngine.prototype.handleStreamResponse = async function(reader, query) {
    try {
        const decoder = new TextDecoder();
        let fullContent = '';
        
        // 创建一个AI消息容器用于流式显示
        const messageElement = this.addStreamMessage('', 'ai');
        const contentElement = messageElement.querySelector('.message-content');
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log('流式传输完成');
                break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.trim() === '') continue;
                if (!line.startsWith('data: ')) continue;
                
                const data = line.slice(6); // 移除 'data: ' 前缀
                
                if (data === '[DONE]') {
                    console.log('收到完成信号');
                    break;
                }
                
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                        const content = parsed.choices[0].delta.content;
                        if (content) {
                            fullContent += content;
                            // 流式更新显示内容
                            await this.updateStreamMessage(contentElement, fullContent);
                        }
                    }
                } catch (parseError) {
                    console.warn('解析流式数据失败:', parseError, 'data:', data);
                }
            }
        }          // 流式传输完成后，等待一小段时间确保所有流式更新完成
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 移除光标
        const cursor = contentElement.querySelector('.cursor');
        if (cursor) {
            cursor.remove();
        }
        
        // 流式传输完成后，使用think标签验证器进行处理
        console.log('流式传输完成，开始使用验证器处理think标签');
        console.log('原文长度:', fullContent.length);
        console.log('是否包含<think>标签:', fullContent.includes('<think>'));
        
        // 获取消息ID
        const messageId = messageElement.dataset.messageId || Date.now().toString();
        if (!messageElement.dataset.messageId) {
            messageElement.dataset.messageId = messageId;
        }
        
        // 存储完整内容到消息元素
        messageElement.dataset.fullContent = fullContent;
        
        // 使用验证器处理think标签
        let finalRenderedContent;
        if (window.thinkTagVerifier && typeof window.thinkTagVerifier.verifyAndFixThinkTags === 'function') {
            console.log('使用Think标签验证器处理内容');
            finalRenderedContent = window.thinkTagVerifier.verifyAndFixThinkTags(
                fullContent, messageId, contentElement, this
            );
        } else {
            console.log('Think标签验证器未加载，使用原有处理方式');
            // 使用正规表达式直接检测和处理think标签
            const thinkTagRegex = /<think>([\s\S]*?)<\/think>/g;
            const thinkMatches = Array.from(fullContent.matchAll(thinkTagRegex));
            
            console.log('检测到think标签数量:', thinkMatches.length);
            
            if (thinkMatches.length > 0) {
                console.log('发现think标签，开始处理...');
                thinkMatches.forEach((match, index) => {
                    console.log(`Think标签 ${index + 1}: 长度=${match[1].length}, 内容预览=${match[1].substring(0, 50)}...`);
                });
            } else {
                console.log('未发现think标签，将进行纯Markdown渲染');
            }
            
            // 执行完整的markdown渲染和think标签处理（如果有think标签的话）
            finalRenderedContent = this.renderMarkdown(fullContent);
        }
        
        console.log('最终渲染完成，内容长度:', finalRenderedContent.length);
        console.log('渲染后是否包含think-container:', finalRenderedContent.includes('think-container'));
        
        contentElement.innerHTML = finalRenderedContent;
        
        // 重新初始化代码高亮
        if (typeof hljs !== 'undefined') {
            contentElement.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
        
        // 绑定think容器的事件监听器
        if (finalRenderedContent.includes('think-container')) {
            this.bindThinkEventListeners(contentElement);
            console.log('✓ Think容器事件监听器已绑定');
        } else {
            console.log('× 未发现think容器，跳过事件绑定');
        }
        
        // 更新复制按钮的内容
        const copyBtn = messageElement.querySelector('.message-copy-btn');
        if (copyBtn) {
            copyBtn.onclick = () => this.copyMessage(fullContent, copyBtn);
        }
        
        if (fullContent && this.settings.historyEnabled) {
            this.saveConversationHistory(query, fullContent);
        }
        
        this.scrollToBottom();
        
    } catch (error) {
        console.error('处理流式响应失败:', error);
        this.addMessage('抱歉，接收回答时出现了问题，请稍后再试。', 'ai', true);
    }
};

// 添加流式消息（初始为空）
AISearchEngine.prototype.addStreamMessage = function(content, type, isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    // 生成并保存消息ID
    const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    messageDiv.dataset.messageId = messageId;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    // 根据消息类型和当前角色设置头像
    if (type === 'user') {
        avatar.innerHTML = '<i class="fas fa-user"></i>';
    } else {
        // AI消息：根据当前选择的角色显示头像  
        const currentRoleData = this.roles && this.roles[this.currentRole] ? this.roles[this.currentRole] : this.roles && this.roles['default'];
        console.log('流式AI消息头像设置 - 当前角色:', this.currentRole, '角色名称:', currentRoleData ? currentRoleData.name : '未知');
        
        if (currentRoleData && currentRoleData.avatar) {
            avatar.innerHTML = `<img src="${currentRoleData.avatar}" alt="${currentRoleData.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            console.log('使用角色头像:', currentRoleData.avatar);
        } else {
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
            console.log('使用默认机器人头像');
        }
    }
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    
    if (isError) {
        bubble.style.background = 'linear-gradient(135deg, var(--danger-color), #ff6b6b)';
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = content || '<span class="cursor">|</span>'; // 添加光标效果
    
    // 添加复制按钮（AI消息）
    if (type === 'ai') {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-copy-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制';
        copyBtn.onclick = () => this.copyMessage('', copyBtn); // 初始为空，稍后更新
        bubble.appendChild(copyBtn);
    }
    
    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    
    bubble.appendChild(contentDiv);
    bubble.appendChild(time);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    
    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
    
    return messageDiv;
};

// 更新流式消息内容
AISearchEngine.prototype.updateStreamMessage = async function(contentElement, fullContent) {
    // 在流式更新过程中，暂时不处理think标签，避免不完整的标签被错误处理
    // 只进行基础的Markdown渲染，think标签的处理留到流式传输完成后
    let renderedContent = fullContent;
    
    if (typeof marked !== 'undefined') {
        try {
            // 保留原始内容，包括可能不完整的think标签
            let tempContent = fullContent;
            
            // 检查是否有think标签需要特殊处理
            const hasThinkTags = tempContent.includes('<think>');
            if (hasThinkTags) {
                console.log('检测到think标签，保持原样进行流式显示');
                // 不再隐藏不完整的think标签，而是保持原样
                // think标签的完整性验证将由think-verification.js处理
            }
            
            renderedContent = marked.parse(tempContent);
            // 只处理代码块，不处理think标签
            renderedContent = this.enhanceCodeBlocks(renderedContent);
        } catch (error) {
            console.warn('流式Markdown渲染失败:', error);
            renderedContent = fullContent;
        }
    }
    
    // 添加打字效果的光标
    contentElement.innerHTML = renderedContent + '<span class="cursor">|</span>';
    
    // 重新初始化代码高亮
    if (typeof hljs !== 'undefined') {
        contentElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
    
    this.scrollToBottom();
    
    // 添加短暂延迟以创建打字效果
    await new Promise(resolve => setTimeout(resolve, 20));
};

// 全局暴露 aiSearchEngine 实例以便 onclick 事件调用
window.aiSearchEngine = window.aiSearchEngine || null;

// 全局变量，用于存储AI搜索引擎实例
let aiSearchEngine = null;

// 当页面加载完成时初始化AI搜索引擎
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化AI搜索引擎');
    
    try {
        aiSearchEngine = new AISearchEngine();
        console.log('AI搜索引擎实例已创建');
        
        // 将实例绑定到window对象，以便全局访问
        window.aiSearch = aiSearchEngine;
        window.aiSearchEngine = aiSearchEngine;
        
        // 暴露测试方法到全局
        window.testRoleFunction = () => aiSearchEngine.testRoleFunction();
        console.log('角色测试方法已暴露到全局作用域');
        
        // 添加清除历史按钮
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-history-btn';
        clearBtn.innerHTML = '<i class="fas fa-trash"></i>';
        clearBtn.title = '清除对话历史';
        clearBtn.addEventListener('click', () => {
            if (confirm('确定要清除所有对话历史吗？')) {
                aiSearchEngine.clearHistory();
            }
        });
        document.body.appendChild(clearBtn);
        console.log('清除历史按钮已添加');
        
        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                document.getElementById('aiSearchInput').focus();
            }
            if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
                e.preventDefault();
                if (confirm('确定要清除所有对话历史吗？')) {
                    aiSearchEngine.clearHistory();
                }
            }
        });
        console.log('键盘快捷键已设置');
        
        // 全局重新生成图片函数（备用）
        window.regenerateImage = function(prompt) {
            if (window.aiSearch && window.aiSearch.regenerateImage) {
                window.aiSearch.regenerateImage(prompt);
            } else {
                console.error('AI搜索引擎未初始化');
            }
        };
        
    } catch (error) {
        console.error('AI搜索引擎初始化失败:', error);
    }
});

// 检查是否已解锁隐藏模型的全局函数
function checkHiddenModelUnlock() {
    if (window.aiSearch && typeof window.aiSearch.unlockGpt4oMini === 'function') {
        window.aiSearch.unlockGpt4oMini();
        return true;
    }
    return false;
}
