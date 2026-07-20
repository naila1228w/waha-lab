// WAhA Lab - Visual Strategy for Valuation
// 页面加载完成后执行的代码

document.addEventListener('DOMContentLoaded', function () {
    console.log('WAhA Lab 页面已加载');

    function fitHeroTitles() {
        const heroTitles = document.querySelectorAll('.title-top, .title-growth, .title-bottom');

        heroTitles.forEach(title => {
            const clip = title.closest('.text-clip-container');
            if (!clip) return;

            title.style.fontSize = '';

            const maxWidth = clip.getBoundingClientRect().width - 8;
            if (maxWidth <= 0) return;

            const range = document.createRange();
            range.selectNodeContents(title);
            const textWidth = range.getBoundingClientRect().width;
            range.detach();

            if (textWidth > maxWidth) {
                const currentFontSize = parseFloat(window.getComputedStyle(title).fontSize);
                const nextFontSize = Math.max(32, currentFontSize * (maxWidth / textWidth));
                title.style.fontSize = `${nextFontSize}px`;
            }
        });
    }

    fitHeroTitles();
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(fitHeroTitles);
    }
    window.addEventListener('resize', fitHeroTitles, { passive: true });

    // Selected Work 滚动动画 (放在最前面以确保优先执行)
    const workItems = document.querySelectorAll('.work-item');
    if (workItems.length > 0) {
        // 先添加 hidden class
        workItems.forEach(item => {
            item.classList.add('reveal-hidden');
        });

        const workObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 // 只要出现10%就触发
        };

        const workObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    observer.unobserve(entry.target); // 动画只触发一次
                }
            });
        }, workObserverOptions);

        workItems.forEach(item => {
            workObserver.observe(item);
        });
        console.log('Work items observer initialized');
    }

    console.log('开始监听滚动事件...');

    // 获取第二屏图片元素和容器
    const screen2Image = document.getElementById('screen2Image');
    const screen2 = document.getElementById('screen2');
    const imageContainer = document.getElementById('screen2ImageContainer');
    const screen2TextWrapper = document.getElementById('screen2TextWrapper');

    if (!screen2Image || !screen2 || !imageContainer || !screen2TextWrapper) {
        return;
    }

    // 追踪是否已经切换到第二阶段，避免重复计算
    let hasEnteredStage2 = false;

    // 存储第一阶段开始时视频的初始位置
    let stage1InitialTop = null;

    // 追踪第四阶段文字动画是否完成

    // 追踪第四阶段文字动画是否完成
    let isTextAnimationComplete = false;
    let textAnimationLockedScrollTop = null; // 锁定滚动位置

    const isMobileViewport = () => window.innerWidth < 768;

    function resetScreen2ForMobile() {
        hasEnteredStage2 = false;
        stage1InitialTop = null;
        isTextAnimationComplete = true;
        textAnimationLockedScrollTop = null;

        screen2.style.height = '';

        imageContainer.style.position = 'relative';
        imageContainer.style.top = 'auto';
        imageContainer.style.left = 'auto';
        imageContainer.style.transform = 'none';
        imageContainer.style.zIndex = 'auto';
        imageContainer.style.marginTop = '-60px';
        imageContainer.style.visibility = 'visible';
        imageContainer.style.opacity = '1';
        imageContainer.style.width = '';
        imageContainer.style.height = '';

        screen2TextWrapper.classList.remove('show');
        screen2TextWrapper.style.position = 'relative';
        screen2TextWrapper.style.top = 'auto';
        screen2TextWrapper.style.left = 'auto';
        screen2TextWrapper.style.transform = 'none';
        screen2TextWrapper.style.zIndex = 'auto';
        screen2TextWrapper.style.visibility = 'visible';
        screen2TextWrapper.style.opacity = '1';
        screen2TextWrapper.style.display = 'flex';

        const mobileTextParts = screen2TextWrapper.querySelectorAll('.screen2-title, .screen2-description');
        mobileTextParts.forEach(function (part) {
            part.style.animation = 'none';
            part.style.transform = 'none';
            part.style.opacity = '1';
        });

        screen2Image.style.transform = 'none';
    }

    function restoreScreen2AnimationStyles() {
        const mobileTextParts = screen2TextWrapper.querySelectorAll('.screen2-title, .screen2-description');
        mobileTextParts.forEach(function (part) {
            part.style.animation = '';
            part.style.transform = '';
            part.style.opacity = '';
        });
    }

    // 容器尺寸（只做容器放大，图片不缩放）
    const containerInitialWidth = 524; // 容器初始宽度
    const containerInitialHeight = 295; // 容器初始高度
    // 动态计算最大宽度，保持左右68px间距 (Simplified Logic)
    const getContainerMaxWidth = () => {
        const viewportWidth = window.innerWidth;

        // Mobile Tier (< 768px)
        if (viewportWidth < 768) {
            // 移动端全宽 (减去左右padding 16px * 2)
            return viewportWidth - 16 * 2;
        }
        // Large Screen Tier (> 1920px)
        else if (viewportWidth > 1920) {
            return 1920 - 68 * 2; // 保持1920px的效果
        }
        // Computer Tier (768px - 1920px)
        else {
            return viewportWidth - 68 * 2; // 流式响应宽度
        }
    };

    const containerMaxWidth = getContainerMaxWidth();
    const containerMaxHeight = 734; // 保持宽高比：1304 * (295/524) ≈ 734px

    // 动态计算第二屏高度，确保视频下方间距固定为200px
    function updateScreen2Height() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Mobile Tier (< 768px): 保持默认高度 (auto)
        if (viewportWidth < 768) {
            resetScreen2ForMobile();
            return;
        }

        restoreScreen2AnimationStyles();

        // Computer / Large Screen Tier (>= 768px)

        // 1. 获取动态计算的视频高度
        const currentMaxWidth = getContainerMaxWidth();
        const currentVideoHeight = currentMaxWidth * (containerInitialHeight / containerInitialWidth);

        // 2. 获取文字高度 (包括标题和描述)
        // 确保文字容器可以被测量 (即使隐藏)
        const wasHidden = screen2TextWrapper.style.display === 'none';
        const originalPosition = screen2TextWrapper.style.position;

        // 临时强制显示以准确测量
        screen2TextWrapper.style.display = 'flex';
        screen2TextWrapper.style.visibility = 'hidden';
        // 如果是fixed定位，可能会影响高度测量（如果父级没高度），这里暂时假设内容高度是固定的

        const textWrapperRect = screen2TextWrapper.getBoundingClientRect();
        // 如果高度为0，尝试使用scrollHeight
        const textHeight = textWrapperRect.height > 50 ? textWrapperRect.height : (screen2TextWrapper.scrollHeight || 200);

        // 恢复原始状态
        if (wasHidden) {
            screen2TextWrapper.style.display = 'none';
            screen2TextWrapper.style.visibility = '';
        } else {
            screen2TextWrapper.style.visibility = ''; // 恢复可见性
        }

        // 3. 计算各个间距
        // 滚动动画总时长对应的距离
        // stage2ScrollRange = windowHeight * 1.5
        // stage4ScrollRange = windowHeight * 0.5
        // 总滚动距离 = 2.0 * windowHeight
        const totalScrollInteractionHeight = windowHeight * 2.0;

        // 4. 固定间距定义
        const headerOffset = 100; // 文字距离顶部的距离 (导航56px + 间距44px)
        const videoGap = 50; // 视频距离文字底部的间距
        const bottomGap = 200; // 目标固定间距：视频底部到下一屏的距离

        // 5. 计算总高度
        // 总高度 = 滚动交互距离 + 最终视觉这一屏的内容高度（视频底部位置） + 底部留白 - 视口高度
        // 等等，我们在前面分析过：
        // TotalHeight = windowHeight + VideoBottomViewport + BottomGap
        // VideoBottomViewport = HeaderOffset + TextHeight + VideoGap + VideoHeight

        const videoBottomViewport = headerOffset + textHeight + videoGap + currentVideoHeight;
        const totalHeight = windowHeight + videoBottomViewport + bottomGap;

        screen2.style.height = `${totalHeight}px`;

        //console.log(`📏 Screen 2 Height Updated: ${totalHeight}px (VideoH: ${currentVideoHeight.toFixed(2)}, TextH: ${textHeight.toFixed(2)})`);
    }

    // 缓动函数 - 用于更平滑的动画效果
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // 滚动事件处理
    function handleScroll() {
        if (isMobileViewport()) {
            resetScreen2ForMobile();
            return;
        }

        restoreScreen2AnimationStyles();

        // 动态更新最大宽度
        const currentMaxWidth = getContainerMaxWidth();
        const currentMaxHeight = currentMaxWidth * (containerInitialHeight / containerInitialWidth);

        let scrollTop = window.pageYOffset || document.documentElement.scrollTop || window.scrollY;
        const windowHeight = window.innerHeight;

        // 如果文字动画未完成，锁定滚动位置（只阻止向下滚动到第五阶段，允许向上滚动）
        if (!isTextAnimationComplete && textAnimationLockedScrollTop !== null) {
            if (scrollTop > textAnimationLockedScrollTop) {
                // 阻止滚动超过锁定位置（向下滚动到第五阶段）
                // 使用 requestAnimationFrame 确保在下一帧执行，避免与滚动事件冲突
                requestAnimationFrame(function () {
                    window.scrollTo({
                        top: textAnimationLockedScrollTop,
                        behavior: 'auto' // 不使用平滑滚动，立即跳转
                    });
                });
                scrollTop = textAnimationLockedScrollTop;
            }
            // 允许向上滚动（不限制）
        }

        // 获取第二屏元素的位置信息
        const screen2Rect = screen2.getBoundingClientRect();
        const screen2Top = screen2Rect.top + scrollTop;
        const screen2Height = screen2Rect.height;

        // 第一阶段：从0%到30%（容器在顶部，逐渐放大）
        const containerEntryPoint = screen2Top - windowHeight; // 容器开始进入视口的位置
        const containerStage1EndPoint = screen2Top; // 第二屏顶部到达视口顶部（第一阶段结束，达到30%）

        // 第二阶段：从30%到100%（容器位置固定，不跟随滚动，完成剩余缩放）
        const stage2ScrollRange = windowHeight * 1.5; // 第二阶段需要滚动1.5个屏幕高度
        const containerStage2EndPoint = containerStage1EndPoint + stage2ScrollRange; // 第二阶段结束位置（达到100%）

        // 第四阶段：从100%开始，视频向下移动，文字出现
        const stage4ScrollRange = windowHeight * 0.5; // 第四阶段需要滚动0.5个屏幕高度
        const containerStage4EndPoint = containerStage2EndPoint + stage4ScrollRange; // 第四阶段结束位置

        // 第五阶段：内容跟随滚动（第四阶段结束后）
        const stage5StartPoint = containerStage4EndPoint; // 第五阶段开始位置

        // 调试信息（每50次滚动输出一次，避免日志过多）
        if (!handleScroll.logCount) handleScroll.logCount = 0;
        handleScroll.logCount++;
        if (handleScroll.logCount % 50 === 0) {
            console.log('滚动中... scrollTop:', scrollTop.toFixed(0), 'containerStage2EndPoint:', containerStage2EndPoint.toFixed(0));
        }

        // 计算整体进度（0-1）
        let progress = 0;
        let isStage2 = false;
        let isStage4 = false;
        let isStage5 = false;

        if (scrollTop < containerEntryPoint) {
            // 还没开始缩放
            progress = 0;
        } else if (scrollTop >= containerStage1EndPoint && scrollTop < containerStage2EndPoint) {
            // 第二阶段：30%到100%（容器位置固定，完成剩余缩放）
            isStage2 = true;
            isStage4 = false;
            isStage5 = false;
            handleScroll.stage4Logged = false; // 重置第四阶段日志标记
            handleScroll.stage5Logged = false; // 重置第五阶段日志标记
            const stage2Progress = (scrollTop - containerStage1EndPoint) / stage2ScrollRange;
            progress = 0.3 + stage2Progress * 0.7; // 从0.3到1
            progress = Math.min(Math.max(progress, 0.3), 1);
        } else if (scrollTop >= containerStage2EndPoint && scrollTop < stage5StartPoint) {
            // 第四阶段：视频向下移动，文字出现
            progress = 1;
            isStage2 = false;
            isStage4 = true;
            isStage5 = false;
            handleScroll.stage5Logged = false; // 重置第五阶段日志标记
            if (!handleScroll.stage4Logged) {
                console.log('🎬 === 进入第四阶段 ===');
                console.log('scrollTop:', scrollTop);
                console.log('containerStage2EndPoint:', containerStage2EndPoint);
                console.log('stage4ScrollRange:', stage4ScrollRange);
                console.log('containerStage4EndPoint:', containerStage4EndPoint);
                handleScroll.stage4Logged = true;
            }
        } else if (scrollTop >= stage5StartPoint) {
            // 第五阶段：内容跟随滚动
            progress = 1;
            isStage2 = false;
            isStage4 = false;
            isStage5 = true;
            if (!handleScroll.stage5Logged) {
                console.log('🎬 === 进入第五阶段（跟随滚动） ===');
                console.log('scrollTop:', scrollTop);
                console.log('stage5StartPoint:', stage5StartPoint);
                handleScroll.stage5Logged = true;
            }
        } else {
            // 第一阶段：0%到30%（容器在顶部逐渐放大）
            const stage1ScrollRange = containerStage1EndPoint - containerEntryPoint;
            const stage1Progress = (scrollTop - containerEntryPoint) / stage1ScrollRange;
            progress = stage1Progress * 0.3; // 从0到0.3
            progress = Math.min(Math.max(progress, 0), 0.3);
        }

        // 应用缓动函数使动画更平滑
        const easedProgress = easeOutCubic(progress);

        // 计算容器尺寸（只做容器放大，图片不缩放）
        // 第一阶段（0-30%）：容器在顶部逐渐放大
        // 第二阶段（30%-100%）：容器位置固定，继续从30%放大到100%
        // 第四阶段和第五阶段：保持最大尺寸
        let currentContainerWidth, currentContainerHeight;

        if (isStage4 || isStage5) {
            // 第四阶段和第五阶段：保持最大尺寸
            currentContainerWidth = currentMaxWidth;
            currentContainerHeight = currentMaxHeight;
        } else {
            // 其他阶段：根据progress计算尺寸
            currentContainerWidth = containerInitialWidth + (currentMaxWidth - containerInitialWidth) * easedProgress;
            currentContainerHeight = containerInitialHeight + (currentMaxHeight - containerInitialHeight) * easedProgress;
        }

        // 更新容器尺寸
        imageContainer.style.width = `${currentContainerWidth}px`;
        imageContainer.style.height = `${currentContainerHeight}px`;

        // 在不同阶段设置容器位置
        if (isStage2) {
            // 第二阶段（30%-100%）：容器固定位置（不跟随滚动），在顶部
            if (!hasEnteredStage2) {
                hasEnteredStage2 = true;
                stage1InitialTop = null; // 重置第一阶段初始位置
                console.log('🎬 进入第二阶段，固定视频在导航栏下方56px');
            }

            // 保持在固定位置（顶部居中，导航栏下方56px）
            imageContainer.style.position = 'fixed';
            imageContainer.style.top = '56px'; // 导航栏高度
            imageContainer.style.left = '50%';
            imageContainer.style.transform = 'translateX(-50%)';
            imageContainer.style.zIndex = '100';
            imageContainer.style.marginTop = '0'; // 清除margin-top，因为现在是fixed定位
        } else if (isStage4) {
            // 第四阶段：视频向下移动，直到距离文字底部50px，文字出现
            hasEnteredStage2 = false;

            // 在进入第四阶段时，立即设置锁定位置（如果还没设置）
            if (textAnimationLockedScrollTop === null) {
                textAnimationLockedScrollTop = containerStage4EndPoint;
                isTextAnimationComplete = false;
                console.log('🎬 进入第四阶段，设置锁定滚动位置:', textAnimationLockedScrollTop);
            }

            // 计算文字的实际高度（需要容器可见但内容可以隐藏）
            // 设置文字容器为fixed定位，但不添加show类，这样容器可见但内容还在初始位置
            screen2TextWrapper.style.position = 'fixed';
            screen2TextWrapper.style.top = '100px'; // 导航56px + 间距44px = 100px
            screen2TextWrapper.style.left = '50%';
            screen2TextWrapper.style.transform = 'translateX(-50%)';
            screen2TextWrapper.style.zIndex = '101';
            screen2TextWrapper.style.visibility = 'visible'; // 让容器可见以计算高度和播放动画
            screen2TextWrapper.style.display = 'flex'; // 确保flex布局生效
            // 不设置opacity，让CSS动画完全控制

            // 计算文字的实际高度（即使文字内容被translateY(100%)，容器高度也是正确的）
            const textWrapperRect = screen2TextWrapper.getBoundingClientRect();
            const textHeight = textWrapperRect.height || 200; // 默认值200px（估计值）

            // 如果高度为0或太小，尝试使用scrollHeight作为后备
            const actualTextHeight = textHeight > 50 ? textHeight : (screen2TextWrapper.scrollHeight || 200);

            const textTop = 100; // 导航56px + 间距44px = 100px

            // 视频应该停止的位置：文字底部 + 50px间距
            const textBottom = textTop + actualTextHeight;
            const videoEndTop = textBottom + 50; // 间距50px
            const videoStartTop = 56; // 视频起始位置（导航栏下方）

            const stage4Progress = (scrollTop - containerStage2EndPoint) / stage4ScrollRange;
            const stage4ProgressClamped = Math.min(Math.max(stage4Progress, 0), 1);

            // 视频从顶部向下移动
            const videoCurrentTop = videoStartTop + (videoEndTop - videoStartTop) * stage4ProgressClamped;

            // 确保视频容器始终可见：使用fixed定位，移动到目标位置
            imageContainer.style.position = 'fixed';
            imageContainer.style.top = `${videoCurrentTop}px`;
            imageContainer.style.left = '50%';
            imageContainer.style.transform = 'translateX(-50%)';
            imageContainer.style.zIndex = '100';
            imageContainer.style.visibility = 'visible';
            imageContainer.style.opacity = '1';

            // 根据进度显示文字：当视频完全到达目标位置（100%）时显示文字
            const textShowThreshold = 0.95; // 降低阈值到0.95，防止滚动锁定早于动画触发导致的死锁
            if (stage4ProgressClamped >= textShowThreshold) {
                // 显示文字：添加show类以触发CSS动画（和第一屏效果一样）
                if (!screen2TextWrapper.classList.contains('show')) {
                    // 首次触发动画，确保锁定位置已设置
                    if (textAnimationLockedScrollTop === null) {
                        textAnimationLockedScrollTop = containerStage4EndPoint;
                    }
                    isTextAnimationComplete = false;
                    console.log('🎬 文字动画开始，锁定滚动位置:', textAnimationLockedScrollTop);
                    console.log('🎬 当前滚动位置:', scrollTop);
                    console.log('🎬 动画完成状态:', isTextAnimationComplete);

                    // 立即强制滚动到锁定位置（如果已经超过）
                    if (scrollTop > textAnimationLockedScrollTop) {
                        window.scrollTo(0, textAnimationLockedScrollTop);
                    }
                }
                screen2TextWrapper.classList.add('show');
                // 移除任何内联opacity样式，让CSS动画完全控制
                screen2TextWrapper.style.opacity = '';
            } else {
                // 文字保持隐藏状态，不添加show类（CSS会处理初始的opacity和transform）
                screen2TextWrapper.classList.remove('show');
                // 移除内联opacity样式，让CSS控制
                screen2TextWrapper.style.opacity = '';
                // 注意：不在这里重置锁定位置，因为锁定应该在进入第四阶段时设置
            }
        } else if (isStage5) {
            // 第五阶段：文字和视频作为一个整体固定，跟随滚动向上移动
            hasEnteredStage2 = false;

            // 如果动画还没完成，继续锁定（防止在动画完成前进入第五阶段）
            if (!isTextAnimationComplete && textAnimationLockedScrollTop !== null) {
                // 强制保持在锁定位置，直到动画完成
                if (scrollTop > textAnimationLockedScrollTop) {
                    window.scrollTo(0, textAnimationLockedScrollTop);
                    return; // 不继续执行第五阶段的逻辑
                }
            }

            // 确保文字完全显示（CSS动画会控制显示效果）
            screen2TextWrapper.style.visibility = 'visible';
            screen2TextWrapper.style.opacity = ''; // 清除内联样式，让CSS控制
            screen2TextWrapper.classList.add('show'); // 添加show类以触发CSS动画
            screen2TextWrapper.style.display = 'flex';
            screen2TextWrapper.style.position = 'fixed';
            screen2TextWrapper.style.left = '50%';
            screen2TextWrapper.style.transform = 'translateX(-50%)';
            screen2TextWrapper.style.zIndex = '101';

            // 先设置文字到初始位置（第四阶段结束时的位置），以便正确计算高度
            screen2TextWrapper.style.top = '100px'; // 导航56px + 间距44px = 100px

            // 获取文字高度（文字已经显示，可以正确获取高度）
            const textWrapperRect = screen2TextWrapper.getBoundingClientRect();
            const textHeight = textWrapperRect.height || 200;

            // 第四阶段结束时，文字在100px位置，视频在文字下方50px位置
            const textStartTop = 100; // 第五阶段开始时文字的top值（导航56px + 间距44px = 100px）
            const videoStartTop = textStartTop + textHeight + 50; // 第五阶段开始时视频的top值（间距50px）

            // 计算滚动增量（从第五阶段开始点算起）
            const scrollDelta = scrollTop - stage5StartPoint;

            // 文字和视频作为一个整体向上移动
            // 文字的当前位置 = 起始位置 - 滚动增量
            const textCurrentTop = textStartTop - scrollDelta;

            // 视频始终保持在文字下方50px的位置
            const videoCurrentTop = textCurrentTop + textHeight + 50;

            // 设置文字位置（fixed定位，跟随滚动向上移动）
            screen2TextWrapper.style.top = `${textCurrentTop}px`;

            // 设置视频位置（fixed定位，跟随文字向上移动）
            imageContainer.style.position = 'fixed';
            imageContainer.style.top = `${videoCurrentTop}px`;
            imageContainer.style.left = '50%';
            imageContainer.style.transform = 'translateX(-50%)';
            imageContainer.style.zIndex = '100';
            imageContainer.style.visibility = 'visible';
            imageContainer.style.opacity = '1';
        } else if (scrollTop >= containerEntryPoint) {
            // 第一阶段（0-30%）：视频从初始位置逐渐移动到导航栏下方56px，同时逐渐放大
            hasEnteredStage2 = false;

            // 计算第一阶段进度
            const stage1ScrollRange = containerStage1EndPoint - containerEntryPoint;
            const stage1Progress = (scrollTop - containerEntryPoint) / stage1ScrollRange;
            const stage1ProgressClamped = Math.min(Math.max(stage1Progress, 0), 1);

            // FIX: 如果处于动画起始点（或刚开始），保持自然流布局
            // 这解决了刷新时布局可能未稳定导致计算错误的问题，并确保初始可见性
            if (stage1ProgressClamped <= 0.01) {
                hasEnteredStage2 = false;
                stage1InitialTop = null; // 清除缓存，确保下次滚动时重新测量

                imageContainer.style.position = 'relative';
                imageContainer.style.top = 'auto';
                imageContainer.style.left = 'auto';
                imageContainer.style.transform = 'none';
                imageContainer.style.marginTop = '-108px'; // 与CSS保持一致
                imageContainer.style.zIndex = 'auto';
                imageContainer.style.visibility = 'visible';
                imageContainer.style.opacity = '1';

                screen2TextWrapper.style.position = 'relative';
                screen2TextWrapper.style.top = 'auto';
                screen2TextWrapper.style.left = 'auto';
                screen2TextWrapper.style.transform = 'none';
                screen2TextWrapper.style.zIndex = 'auto';
                screen2TextWrapper.style.visibility = 'hidden';
                screen2TextWrapper.style.opacity = '0';
                screen2TextWrapper.classList.remove('show');
                return; // 跳过后续的 fixed 逻辑
            }

            // 在第一阶段开始时（且已有滚动），捕获视频的初始视口位置
            // 如果之前已经计算过初始位置（可能从第二阶段返回），需要重置并重新获取
            if (stage1InitialTop !== null) {
                // 从其他阶段返回第一阶段，需要重置初始位置，重新获取当前位置
                stage1InitialTop = null;
                console.log('🎬 返回第一阶段，重置初始位置');
            }

            if (stage1InitialTop === null) {
                // 确保视频在文档流中的正确位置
                imageContainer.style.position = 'relative';
                imageContainer.style.top = 'auto';
                imageContainer.style.left = 'auto';
                imageContainer.style.transform = 'none';
                imageContainer.style.marginTop = '-108px'; // 与CSS保持一致
                imageContainer.style.zIndex = 'auto';

                // 强制重排，确保获取到正确的位置
                void imageContainer.offsetHeight;

                // 获取初始视口位置（相对于视口顶部的距离）
                const initialRect = imageContainer.getBoundingClientRect();
                stage1InitialTop = initialRect.top; // 保存初始视口top值
                console.log('🎬 第一阶段开始，初始位置:', stage1InitialTop);
            }

            // 第一阶段：逐渐从初始位置移动到导航栏下方56px
            const targetTop = 56; // 导航栏下方56px
            // 确保初始位置有效，避免计算错误
            if (stage1InitialTop !== null && !isNaN(stage1InitialTop)) {
                const currentTop = stage1InitialTop + (targetTop - stage1InitialTop) * stage1ProgressClamped;

                imageContainer.style.position = 'fixed';
                imageContainer.style.top = `${currentTop}px`;
                imageContainer.style.left = '50%';
                imageContainer.style.transform = 'translateX(-50%)';
                imageContainer.style.zIndex = '100';
                imageContainer.style.marginTop = '0'; // 清除margin-top，因为使用fixed定位
                imageContainer.style.visibility = 'visible';
                imageContainer.style.opacity = '1';
            } else {
                // 如果初始位置获取失败，回退到文档流定位
                imageContainer.style.position = 'relative';
                imageContainer.style.top = 'auto';
                imageContainer.style.left = 'auto';
                imageContainer.style.transform = 'none';
                imageContainer.style.marginTop = '-108px';
                imageContainer.style.zIndex = 'auto';
            }

            screen2TextWrapper.style.position = 'relative';
            screen2TextWrapper.style.top = 'auto';
            screen2TextWrapper.style.left = 'auto';
            screen2TextWrapper.style.transform = 'none';
            screen2TextWrapper.style.zIndex = 'auto';
            screen2TextWrapper.style.visibility = 'hidden';
            screen2TextWrapper.style.opacity = '0';
            screen2TextWrapper.classList.remove('show');
        } else {
            // 还没进入第一阶段，保持文档流定位和初始位置
            hasEnteredStage2 = false;
            stage1InitialTop = null; // 重置初始位置

            imageContainer.style.position = 'relative';
            imageContainer.style.top = 'auto';
            imageContainer.style.left = 'auto';
            imageContainer.style.transform = 'none';
            imageContainer.style.zIndex = 'auto';
            imageContainer.style.marginTop = '-108px'; // 保持初始位置的margin-top
            imageContainer.style.visibility = 'visible';
            imageContainer.style.opacity = '1';

            screen2TextWrapper.style.position = 'relative';
            screen2TextWrapper.style.top = 'auto';
            screen2TextWrapper.style.left = 'auto';
            screen2TextWrapper.style.transform = 'none';
            screen2TextWrapper.style.zIndex = 'auto';
            screen2TextWrapper.style.visibility = 'hidden';
            screen2TextWrapper.style.opacity = '0';
            screen2TextWrapper.classList.remove('show');
        }

        // 图片不缩放，始终为原始尺寸
        screen2Image.style.transform = 'scale(1)';
    }

    // 使用 Intersection Observer 优化性能
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
    };

    // 监听滚动事件（使用 requestAnimationFrame 优化性能）
    let rafId = null;
    function onScroll() {
        if (rafId === null) {
            rafId = requestAnimationFrame(function () {
                handleScroll();
                rafId = null;
            });
        }
    }

    // 添加滚动阻止机制（用于动画锁定）
    let lastScrollTop = 0;
    function preventScrollIfLocked(e) {
        if (isMobileViewport()) {
            return;
        }

        if (!isTextAnimationComplete && textAnimationLockedScrollTop !== null) {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop || window.scrollY;

            // 检查是否是向下滚动
            // deltaY > 0 表示向下滚动（标准wheel事件）
            // wheelDelta < 0 表示向下滚动（旧版IE/Webkit）
            const deltaY = e.deltaY !== undefined ? e.deltaY : (e.wheelDelta ? -e.wheelDelta / 120 : 0);

            // 如果当前已经在锁定位置或超过锁定位置，且尝试向下滚动，则阻止
            if (currentScrollTop >= textAnimationLockedScrollTop - 1 && deltaY > 0) { // -1 是为了处理浮点数精度问题
                // 向下滚动，阻止
                e.preventDefault();
                e.stopPropagation();
                // 立即强制滚动回锁定位置
                window.scrollTo(0, textAnimationLockedScrollTop);
                return false;
            }
        }
    }

    // 监听鼠标滚轮事件（使用capture阶段，更早拦截）
    window.addEventListener('wheel', preventScrollIfLocked, { passive: false, capture: true });

    // 在scroll事件中也强制阻止（作为双重保护）
    function preventScrollInScrollEvent() {
        if (isMobileViewport()) {
            return;
        }

        if (!isTextAnimationComplete && textAnimationLockedScrollTop !== null) {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop || window.scrollY;

            // 如果滚动超过锁定位置，立即拉回
            if (currentScrollTop > textAnimationLockedScrollTop) {
                window.scrollTo(0, textAnimationLockedScrollTop);
            }
        }
    }

    // 使用非passive的scroll监听器来强制阻止
    window.addEventListener('scroll', function (e) {
        preventScrollInScrollEvent();
        onScroll(); // 继续执行原有的滚动处理
    }, { passive: false });

    // 监听触摸滚动事件（移动端）
    let touchStartY = 0;
    window.addEventListener('touchstart', function (e) {
        if (isMobileViewport()) {
            return;
        }

        if (!isTextAnimationComplete && textAnimationLockedScrollTop !== null) {
            touchStartY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
        if (isMobileViewport()) {
            return;
        }

        if (!isTextAnimationComplete && textAnimationLockedScrollTop !== null) {
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop || window.scrollY;
            if (currentScrollTop >= textAnimationLockedScrollTop) {
                const touchY = e.touches[0].clientY;
                const deltaY = touchStartY - touchY; // 向下滑动时deltaY为正
                if (deltaY > 0) {
                    // 向下滑动，阻止
                    e.preventDefault();
                    return false;
                }
            }
        }
    }, { passive: false });

    // 监听文字动画完成事件
    const screen2Title = screen2TextWrapper.querySelector('.screen2-title');
    const screen2Description = screen2TextWrapper.querySelector('.screen2-description');

    if (screen2Title && screen2Description) {
        // 监听最后一个动画完成（description的动画，因为它延迟0.15s，最后完成）
        let titleAnimationDone = false;
        let descriptionAnimationDone = false;

        function checkAnimationComplete() {
            if (titleAnimationDone && descriptionAnimationDone && !isTextAnimationComplete) {
                isTextAnimationComplete = true;
                const oldLockedPosition = textAnimationLockedScrollTop;
                textAnimationLockedScrollTop = null;
                console.log('🎬 文字动画完成，解除滚动锁定');
                console.log('🎬 之前锁定位置:', oldLockedPosition);
            }
        }

        screen2Title.addEventListener('animationend', function () {
            titleAnimationDone = true;
            checkAnimationComplete();
        });

        screen2Description.addEventListener('animationend', function () {
            descriptionAnimationDone = true;
            checkAnimationComplete();
        });

        // 监听show类的添加，重置动画完成标志
        let previousHasShowClass = false;
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const hasShowClass = screen2TextWrapper.classList.contains('show');
                    // 只在show类从无到有时重置标志（避免重复重置）
                    if (hasShowClass && !previousHasShowClass) {
                        titleAnimationDone = false;
                        descriptionAnimationDone = false;
                    }
                    previousHasShowClass = hasShowClass;
                }
            });
        });

        observer.observe(screen2TextWrapper, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // 初始调用一次
    updateScreen2Height(); // 先计算高度
    handleScroll();

    // 监听窗口大小变化
    window.addEventListener('resize', function () {
        updateScreen2Height(); // 重新计算高度
        handleScroll(); // 重新计算滚动位置
    }, { passive: true });

});
