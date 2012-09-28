(function(){
    App.defineView('Tabbar', {

        options: {
            maxTabWidth: 200
        },

        tagName: "div",
        className: "",

        tabbarTpl: _.template('<ul class="nav nav-tabs b-tabbar _tabbar{cid}">'+
            '<li class="dropdown more menu-item" style="display: none;">'+
                '<a href="#"><b class="caret"></b></a>'+
                '<ul class="dropdown-menu"></ul>'+
            '</li>'+
            '</ul>'
        ),
        groupTpl: _.template('<li class="menu-item"></li>'),
        groupTabsTpl: _.template('<div class="tab_container" style="display: none"></div>'),
        groupTabsContainerTpl: _.template('<div class="_tabbar_content{cid}"></div>'),

        init: function(){
            var self = this;

            this._tabs = {};
            this._tabComponents = {};
            this._disabledTabs = {};
            this._prevIndex = undefined;
            this._currentIndex = undefined;
            this._tabbar = '._tabbar'+this.cid;
        },

        doRender: function(){

            var self = this;

            this.$el.append($(this.tabbarTpl({
                cid: this.cid
            })));
            this.$el.append($(this.groupTabsContainerTpl({
                cid: this.cid
            })));

            this._groupsMenuEl = this.$el.find('._tabbar'+this.cid);
            this._groupsTabsEl = this.$el.find('._tabbar_content'+this.cid);

            this._groupsMenuEl.on('click', ".state_active", function(e){
                e.stopPropagation();
                var index = $(this).parent().data('index');
                if(index || index === 0) {
                    self.activeTab(parseInt(index, 10));
                }
            });
            this._groupsMenuEl.on('click', ".tab-close", function(e){
                e.stopPropagation();
                var index = $(this).parent().data('index');
                self.removeTab(index);
            });
            this._groupsMenuEl.on('click', ".more > a", function(e){
                e.stopPropagation();
                openMoreList.call(self);
            });

            this.bind('resize', function() {
                _resize.call(self);
            });

            return this;
        },

        doPresenter: function(){

            if(!this._presenterOnce) {
                this._presenterOnce = true;
            }

        },

        addTab: function(component, label, tabIndex, isClosable){

            if(!tabIndex && tabIndex !== 0) {
                var count = 0;
                for(var index in this._tabComponents) {
                    count++;
                }
                tabIndex = count;
            }

            var groupEl = _getMenuEl.call(this, tabIndex);
            var moreEl = this._groupsMenuEl.find('.more');
            if(groupEl.length) {
                return this;
            }

            if(groupEl.length===0) {
                groupEl = $(this.groupTpl())
                    .attr('data-index', tabIndex);
                this._groupsMenuEl.children().each(function(){
                    if($(this).data('index')>tabIndex) {
                        groupEl.insertBefore($(this));
                        return false;
                    }
                });
                if(this._groupsMenuEl.has(groupEl).length===0) {
                    groupEl.insertBefore($(moreEl));
                }
            }

            var groupTabsEl = _getTabsEl.call(this, tabIndex);

            if(groupTabsEl.length===0) {
                groupTabsEl = $(this.groupTabsTpl({
                    cid: self.cid
                }))
                    .attr('data-index', tabIndex);
                this._groupsTabsEl.children().each(function(){
                    if($(this).data('index')>tabIndex) {
                        groupTabsEl.insertBefore($(this));
                        return false;
                    }
                });
                if(this._groupsTabsEl.has(groupTabsEl).length===0) {
                    this._groupsTabsEl.append(groupTabsEl);
                }
            }

            var linkTpl = '<a href="#" class="title state_active">'+label+'</a>';
            if(isClosable) {
                linkTpl += '<a class="tab-close"></a>';
            }

            groupEl.append($(linkTpl));
            groupTabsEl.append(component.$el);
            // this.activeTab(tabIndex);
            this._tabComponents[tabIndex] = component;

            _resize.call(this);

            this.trigger('addtab', tabIndex);

            return this;
        },

        setTitle: function(tabIndex) {
            var groupEl = _getMenuEl.call(this, tabIndex);
            if(!groupEl) {
                return this;
            }

            _resize.call(this);

            return this;
        },

        getTab: function(index) {
            return this._tabComponents[index];
        },

        getTabIndex: function(component) {
            var result = null;
            $.each(this._tabComponents, function(index, value) {
                if(component === value || component === value.$el) {
                    result = index;
                }
            });
            return result;
        },

        removeTab: function(tabIndex) {
            var self = this,
                menuEl = _getMenuEl.call(this, tabIndex),
                tabEl = _getTabsEl.call(this, tabIndex);
            if(!menuEl || !tabEl) {
                return this;
            }

            openNearbyTab.call(this, this._groupsMenuEl, tabIndex);

            menuEl.remove();
            tabEl.remove();

            delete this._tabComponents[tabIndex];

            _resize.call(this);

            this.trigger('removetab', tabIndex);

            return this;
        },

        activeTab: function(tabIndex) {
            closeMoreList.call(this);

            var menuEl = _getMenuEl.call(this, tabIndex),
                dropdownListEl = $(this._groupsMenuEl).find('.dropdown-menu'),
                tabEl = _getTabsEl.call(this, tabIndex);
            if(!menuEl || !tabEl || this._disabledTabs[tabIndex]) {
                return this;
            }

            dropdownListEl.children().each(function(){
                $(this).removeClass('state_active');
            });

            this._groupsMenuEl.children().each(function(){
                $(this).removeClass('state_active');
            });
            menuEl.addClass('state_active');

            this._groupsTabsEl.children().each(function(){
                $(this).hide();
            });
            tabEl.fadeIn(200);

            this._prevIndex = this._currentIndex;
            this._currentIndex = tabIndex;

            _resize.call(this);

            // var dropEl = dropdownListEl.find('[data-index="'+tabIndex+'"]');
            // if(dropEl && dropEl.length) {
            //     dropEl.insertBefore(this._groupsMenuEl.children()[0]);
            //     _resize.call(this);
            // }

            this.trigger('activetab', this._currentIndex, this._prevIndex);

            return this;
        },

        disableTab: function(tabIndex) {
            var menuEl = _getMenuEl.call(this, tabIndex);
            menuEl.find('a').removeClass('state_active').addClass('state_disabled');

            this._disabledTabs[tabIndex] = true;

            this.trigger('enablechangetab', tabIndex, false);

            return this;
        },

        enableTab: function(tabIndex) {
            var menuEl = _getMenuEl.call(this, tabIndex);
            menuEl.find('a').addClass('state_active').removeClass('state_disabled');

            delete this._disabledTabs[tabIndex];

            this.trigger('enablechangetab', tabIndex, true);

            return this;
        }

    });

    function _getMenuEl(index) {
        return this._groupsMenuEl.find('[data-index='+index+']');
    }
    function _getTabsEl(index) {
        return this._groupsTabsEl.find('[data-index='+index+']');
    }

    function _resize() {
        _fixTabWidths.call(this);
        var self = this,
            menuEl = $(this._groupsMenuEl),
            dropdownListEl = $(this._groupsMenuEl).find('.dropdown-menu'),
            menuWidth = menuEl.width(),
            moreEl = this._groupsMenuEl.find('.more'),
            tabsWidth = $(moreEl).width();
        if(!menuWidth) {
            return;
        }

        dropdownListEl.children().each(function(){
            $(this).insertBefore($(moreEl));
        });

        var hiddenTabsCount = 0;
        this._groupsMenuEl.children().each(function(){
            tabsWidth += $(this).width();
            if($(this).attr('class').indexOf('more') == -1) {
                if(tabsWidth > menuWidth) {
                    hiddenTabsCount++;
                    $(this).hide();
                } else {
                    $(this).show();
                }
            }
        });
        if(hiddenTabsCount) {
            moreEl.show();
        } else {
            moreEl.hide();
        }

        this._groupsMenuEl.children().each(function(){
            var isVisible = ($(this).css('display') != 'none');
            if($(this).attr('class').indexOf('more') == -1 && !isVisible) {
                var el = $(this);
                if(dropdownListEl.children().length) {
                    $(this).insertBefore(dropdownListEl.children()[0]);
                } else {
                    dropdownListEl.append($(this));
                }
            }
        });
        dropdownListEl.children().each(function(){
            $(this).show();
        });
    }

    function _fixTabWidth(el, maxWidth) {
        if(el.width() >= maxWidth) {
            el.addClass('max_width');
            el.find('.title').width(maxWidth);
        } else {
            el.removeClass('max_width');
            el.find('.title').width('auto');
        }
    }

    function _fixTabWidths(index) {
        var self = this,
            maxTabWidth = this.options.maxTabWidth;
        if(index || index === 0) {
            var menuEl = this._groupsMenuEl.find('[data-index='+tabIndex+']');
            _fixTabWidth($(menuEl), maxTabWidth);
        } else {
            this._groupsMenuEl.children().each(function(){
                _fixTabWidth($(this), maxTabWidth);
            });
        }
    }

    // first trying to open closest available tab from left, than from right
    function openNearbyTab(module, _currentIndex, _mode, _origTabIndex) {
        var self = this,
            _origTabIndex = _origTabIndex || _currentIndex,
            tabsCount = module.children().length,
            currentIndex = parseInt(_currentIndex, 10),
            currentArrayIndex,
            tabActivated = false;

        $.each(module.children(), function(arrayIndex, item){
            if(parseInt($(this).data('index'), 10) === currentIndex) {
                currentArrayIndex = arrayIndex;
            }
        });
        if(currentArrayIndex || currentArrayIndex === 0) {
            if(!_mode && currentArrayIndex-1 >= 0) {
                var prevDataIndex = $(module.children()[currentArrayIndex-1]).data('index');
                if(!self._disabledTabs[prevDataIndex] && _origTabIndex !== prevDataIndex) {
                    self.activeTab(prevDataIndex);
                    tabActivated = true;
                } else {
                    return openNearbyTab.call(self, module, prevDataIndex, _mode, _origTabIndex);
                }
            } else if(_mode && currentArrayIndex+1 <= tabsCount) {
                var currentDataIndex = $(module.children()[currentArrayIndex]).data('index');
                if(!self._disabledTabs[currentDataIndex] && _origTabIndex !== currentDataIndex) {
                    self.activeTab(currentDataIndex);
                    tabActivated = true;
                }
            } else if(!tabActivated && _mode && currentArrayIndex+1 <= tabsCount) {
                var nextDataIndex = $(module.children()[currentArrayIndex+1]).data('index');
                if(!self._disabledTabs[nextDataIndex] && _origTabIndex !== nextDataIndex) {
                    self.activeTab(nextDataIndex);
                    tabActivated = true;
                } else {
                    return openNearbyTab.call(self, module, nextDataIndex, _mode, _origTabIndex);
                }
            }
            if(!tabActivated && currentArrayIndex-1 < 0 && !_mode ||
                !tabActivated && currentArrayIndex === 0 && !_mode ||
                !tabActivated && currentArrayIndex+1 < tabsCount && _mode) {
                var nextDataIndex = $(module.children()[currentArrayIndex+1]).data('index');
                return openNearbyTab.call(self, module, nextDataIndex, true, _origTabIndex);
            }
        }
        if(!currentArrayIndex && currentArrayIndex !== 0 &&
            module.children().length && (module.children().length > self._disabledTabs.length)) {
            var nextDataIndex = $(module.children()[0]).data('index');
            return openNearbyTab.call(self, module, nextDataIndex, true, _origTabIndex);
        }
    }

    function openMoreList() {
        setOuterListener.call(true, this);
        var dropdown = this._groupsMenuEl && this._groupsMenuEl.find('.dropdown');
        dropdown && dropdown.addClass('open');
    }

    function closeMoreList() {
        setOuterListener.call(false, this);
        var dropdown = this._groupsMenuEl && this._groupsMenuEl.find('.dropdown');
        dropdown && dropdown.removeClass('open');
    }

    function setOuterListener(state) {
        var self = this;
        var closeFn = function() {
            closeMoreList.call(self);
        };

        if(state) {
            $('body').bind('click', closeFn);
        } else {
            $('body').unbind('click', closeFn);
        }
    }

})();