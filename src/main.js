var allItems = _.groupBy(loadAllItems(), 'barcode');


function printInventory(inputItems) {
    var items = transformItems(inputItems);
    var inventory = '***<没钱赚商店>购物清单***\n';
    inventory += getItemsInventory(items);
    inventory += '----------------------\n挥泪赠送商品：\n';
    inventory += getDiscountItemsInventory(items);
    inventory += '----------------------\n';
    inventory += getSummary(items);
    inventory += '**********************';
    console.log(inventory);
}

function transformItems(items) {
    function convertItem(item) {
        var itemList = item.split('-');
        if (itemList.length == 1) {
            return item;
        }

        if (itemList.length == 2) {
            return Array(_.parseInt(itemList[1])).fill(itemList[0]);
        }

        throw new Error('input error');
    }

    return _.countBy(_.flatten(_.map(items, convertItem)));
}

function getItemsInventory(items) {
    var inventory = '';
    _(items).forEach(function (totalNum, barcode) {
        var item = allItems[barcode];
        if (item) {
            var chargedNum = getChargedItemNum(totalNum, barcode);
            inventory += '名称：' + item[0]['name'] + '，'
                + '数量：' + totalNum + item[0]['unit'] + '，'
                + '单价：' + item[0]['price'].toFixed(2) + '(元)，'
                + '小计：' + (chargedNum * item[0]['price']).toFixed(2) + '(元)\n';
        }
    });
    return inventory;
}

function getChargedItemNum(totalNum, barcode) {
    var promotions = loadPromotions();
    for (var index in promotions) {
        var promotion = promotions[index];
        var barcodes = promotion['barcodes'];
        if (_.include(barcodes, barcode)) {
            var type = promotion['type'];
            switch (type) {
                case 'BUY_TWO_GET_ONE_FREE':
                    return totalNum - totalNum % 2;
                default:
                    return totalNum;
            }
        }
    }
    return totalNum;
}

function getDiscountItemsInventory(items) {
    var inventory = '';
    _(items).forEach(function (totalNum, barcode) {
        var item = allItems[barcode];
        if (item) {
            var chargedNum = getChargedItemNum(totalNum, barcode);
            if (totalNum - chargedNum) {
                inventory += '名称：' + item[0]['name'] + '，'
                    + '数量：' + (totalNum - chargedNum) + item[0]['unit'] + '\n';
            }
        }
    });
    return inventory;
}

function getSummary(items) {
    var totalPrice = 0;
    var savedMoney = 0;
    _(items).forEach(function (totalNum, barcode) {
        var item = allItems[barcode];
        if (item) {
            var chargedNum = getChargedItemNum(totalNum, barcode);
            totalPrice += chargedNum * item[0]['price'];
            savedMoney += (totalNum - chargedNum) * item[0]['price'];
        }
    });

    return '总计：' + totalPrice.toFixed(2) + '(元)\n'
        + '节省：' + savedMoney.toFixed(2) + '(元)\n';
}
