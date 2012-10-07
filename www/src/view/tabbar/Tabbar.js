(function(App){

    App.defineView('Tabbar', {

        options: {
            maxTabWidth: 200
        },

        tagName: "div",
        className: "b-tabbar-h",

        init: function(){
            var self = this;
        },

        doRender: function(){

            var self = this;

            this.$el.append($(tabbarTpl({
                cid: this.cid
            })));
            this.$el.append($(groupTabsContainerTpl({
                cid: this.cid
            })));

            this._groupsMenuEl = this.$el.find('._tabbar'+this.cid);
            this._groupsTabsEl = this.$el.find('._tabbar_content'+this.cid);

            this._tabComponents = {};
            this._hidddenTabs = {};
            this._disabledTabs = {};
            this._tabsOpenTimes = {};

            this.dropdownTabs = new Dropdown();

            moreButton = new Button({
                text: '...',
                menu: this.dropdownTabs
            });

            this._groupsMenuEl.on('click', ".active", function(e){
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

            this._groupsMenuEl.find('.dropdown').append(moreButton.$el);

            _resize.call(this);

            return this;
        },
        doLayout: function(){
            _resize.call(this);
        },
        addTab: function(component, label, tabIndex, isClosable){



            var maxIndex = -1;

            if(!tabIndex && tabIndex !== 0) {
                var count = 0;
                this._groupsTabsEl.children().each(function(){
                    var rawIndex = $(this).data('index');
                    var index = rawIndex && parseInt(rawIndex, 10);
                    maxIndex = (maxIndex < index) ? index : maxIndex;
                });
                tabIndex = maxIndex+1;
            }

            this._tabsOpenTimes[tabIndex] = new Date().getTime();

            this._tabComponents[tabIndex] = component;

            addTabHeader.call(this, component, label, tabIndex, isClosable);
            addTabContent.call(this, component, label, tabIndex, isClosable);

            _resize.call(this);
            this.trigger('addtab', tabIndex);

            return this;
        },

        removeTab: function(tabIndex) {
            var self = this,
                menuEl = _getMenuEl.call(this, tabIndex),
                tabEl = _getTabsEl.call(this, tabIndex);
            if(!menuEl || !tabEl) {
                return this;
            }

            menuEl.remove();
            tabEl.remove();

            var hiddenButton = this._hidddenTabs[tabIndex];
            if(hiddenButton) {
                var btnIndex = self.dropdownTabs.getButtonIndex(hiddenButton);
                if(btnIndex || btnIndex === 0) {
                    self.dropdownTabs.removeButton(btnIndex);
                }
                delete this._hidddenTabs[tabIndex];
            }
            delete this._tabsOpenTimes[tabIndex];

            delete this._tabComponents[tabIndex];

            _resize.call(this);
            this.trigger('removetab', tabIndex);

            openClosest.call(this, tabIndex);

            return this;
        },

        setTitle: function(tabIndex, title) {
            title = title || '';

            var menuEl = _getMenuEl.call(this, tabIndex);
            if(menuEl) {
                menuEl.find('.title').text(title);
            }
            var hiddenButton = this._hidddenTabs[tabIndex];
            if(hiddenButton) {
                hiddenButton.setText(title);
            }

            _resize.call(this);

            return this;
        },

        getTab: function(tabIndex) {
            return this._tabComponents[tabIndex];
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
        activeTab: function(tabIndex, isSilent) {
            if(this._activeIndex == tabIndex) return this;
            
            this._tabsOpenTimes[tabIndex] = new Date().getTime();
            
            var event = {},
                prev = this._activeIndex;
            if(!isSilent) this.trigger('beforetabchange', event, tabIndex, prev);
            if(event.cancel) return this;
            this._activeIndex = tabIndex;
            activateTabHeader.call(this, tabIndex);
            openTabContent.call(this, tabIndex);
            if(!isSilent) this.trigger('tabchange', tabIndex, prev);
            return this;
        },
        disableTab: function(tabIndex) {
            var menuEl = _getMenuEl.call(this, tabIndex);
            menuEl.find('a').removeClass('active').addClass('disabled');
            this._disabledTabs[tabIndex] = true;
            if(this._hidddenTabs[tabIndex]) {
                this._hidddenTabs[tabIndex].disable();
            }

            return this;
        },

        enableTab: function(tabIndex) {
            var menuEl = _getMenuEl.call(this, tabIndex);
            menuEl.find('a').addClass('active').removeClass('disabled');
            delete this._disabledTabs[tabIndex];
            if(this._hidddenTabs[tabIndex]) {
                this._hidddenTabs[tabIndex].enable();
            }

            return this;
        }

    });

    var Dropdown = App.getView('Dropdown'),
        Button = App.getView('Button'),
        tabbarTpl = _.template('<ul class="nav nav-tabs b-tabbar _tabbar{cid}">'+
            '<li class="dropdown open more menu-item">'+
            '</li>'+
            '</ul>'
        ),
        groupTpl = _.template('<li class="menu-item"></li>'),
        groupTabsTpl = _.template('<div class="tab_container" style="display: none"></div>'),
        groupTabsContainerTpl = _.template('<div class="_tabbar_content{cid}"></div>');

    function _getMenuEl(index) {
        return this._groupsMenuEl.find('[data-index='+index+']');
    }
    function _getTabsEl(index) {
        return this._groupsTabsEl.find('[data-index='+index+']');
    }

    function activateTabHeader(tabIndex) {
        var menuEl = _getMenuEl.call(this, tabIndex);
        this._groupsMenuEl.children().each(function(){
            $(this).removeClass('active');
        });
        menuEl.addClass('active');
    }

    function openTabContent(tabIndex) {
        tabEl = _getTabsEl.call(this, tabIndex);
        this._groupsTabsEl.children().each(function(){
            $(this).hide();
        });
        tabEl.fadeIn(200);
        
        var component = this._tabComponents[tabIndex];
        if(component.layout) component.layout();
    }

    function addTabHeader(component, label, tabIndex, isClosable) {
        var groupEl = _getMenuEl.call(this, tabIndex);
        var moreEl = this._groupsMenuEl.find('.more');
        if(groupEl.length) {
            return this;
        }

        if(groupEl.length===0) {
            groupEl = $(groupTpl())
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
        var linkTpl = '<a href="javascript:void(0);" class="title active">'+label+'</a>';
        if(isClosable) {
            linkTpl += '<a class="tab-close"></a>';
        }
        groupEl.append($(linkTpl));
    }

    function addTabContent(component, label, tabIndex, isClosable) {
        var groupTabsEl = _getTabsEl.call(this, tabIndex);
        if(groupTabsEl.length===0) {
            groupTabsEl = $(groupTabsTpl({
                cid: this.cid
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
        groupTabsEl
            .data('component', component)
            .append(component.$el || component);
    }

    function getClosestNumber(index, indexes) {
        var minIndex, minValue, diff;
        for(var i in indexes) {
            diff = Math.abs(indexes[i] - index);
            if(diff < minValue || !minValue) {
                minValue = diff;
                minIndex = indexes[i];
            }
        }
        return minIndex;
    }

    function openClosest(index) {
        var self = this,
            indexes = {};
        for (var i in this._hidddenTabs) {
            if(!self._disabledTabs[i]) {
                indexes[i] = i;
            }
        }
        this._groupsMenuEl.children().each(function(){
            var _el = $(this),
                _rawIndex = _el.data('index'),
                _index = _rawIndex && parseInt(_rawIndex, 10),
                _isDisabled = self._disabledTabs[_index];
            if((_rawIndex || _rawIndex === 0) && !_isDisabled) {
                indexes[_index] = _index;
            }
        });
        var newActiveIndex = getClosestNumber(index, indexes);
        this.activeTab(newActiveIndex);
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

    function getSortedTabsByTime() {
        var arrayToSort = [], sortedArray;
        for(var i in this._tabsOpenTimes) {
            arrayToSort.push({ id: parseInt(i, 10), time: this._tabsOpenTimes[i]});
        }
        return arrayToSort.sort(function(a, b){
            return (a.time != b.time) ? (b.time - a.time) : (b.id - a.id);
        });
    }

    function _resize() {
        var self = this;
        if(this._resizeDelay) {
            clearTimeout(this._resizeDelay);
        }
        this._resizeDelay = setTimeout(function(){
            doResize.call(self);
        }, 100);
    }

    function doResize() {

        _fixTabWidths.call(this);
        var self = this,
            menuEl = $(this._groupsMenuEl),
            menuWidth = menuEl.width(),
            moreEl = this._groupsMenuEl.find('.dropdown'),
            tabsWidth = $(moreEl).width();
        if(!menuWidth) {
            return;
        }

        var toHide = {}, toShow = {};

        var tabsByTime = getSortedTabsByTime.call(this),
            _el,
            _index;
        var hiddenTabsCount = 0;
        for(var i in tabsByTime) {
            _index = tabsByTime[i].id;
            _el = _getMenuEl.call(self, _index);
            tabsWidth += _el.width();
            if(_el.attr('class').indexOf('more') == -1) {
                if(tabsWidth > menuWidth) {
                    hiddenTabsCount++;
                    if(!self._hidddenTabs[_index]) {
                        _el.hide();
                        toHide[_index] = _index;
                        self._hidddenTabs[_index] = new Button({
                            text: _el.find('.title').text(),
                            click: (function(activateIndex){
                                return function() {
                                    self.activeTab(activateIndex);
                                }
                            })(_index)
                        });
                    }
                } else {
                    if(self._hidddenTabs[_index]) {
                        toShow[_index] = self._hidddenTabs[_index];
                        delete self._hidddenTabs[_index];
                        _el.show();
                    }
                }
            }
        }

        if(hiddenTabsCount) {
            moreEl.show();
        } else {
            moreEl.hide();
        }

        for(var i in toShow) {
            var btnIndex = self.dropdownTabs.getButtonIndex(toShow[i]);
            if(btnIndex || btnIndex === 0) {
                self.dropdownTabs.removeButton(btnIndex);
            }
        }

        for(var j in toHide) {
            var addBtn = self._hidddenTabs[toHide[j]];
            var addBtnIndex = self.dropdownTabs.getButtonIndex(addBtn);
            if(addBtnIndex === -1) {
                self.dropdownTabs.addButton(addBtn);
            }
        }
    }

})(App);
