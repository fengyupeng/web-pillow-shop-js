/*
The controller for Flip Stitch Pillow Web Shop 
Three views:
    home: where all products are displayed
    product detail: detail description of ingle products
    cart: view of all the products put into the cart bt the user
cart data stored and shared across views using localStorage
*/


/* temporary list of all items added to the cart
 saved to localStorage everytime jumping to another view */
var cartList = [];
//globals name and proce properties of all the product
var nameList = ["Couch Pillow", "Bed Pillow", "Round Pillow", "Floor Pouf Pillow"];
var priceList = [25, 28, 15, 25];
var idList = ["couch", "bed", "round", "floor"];


$(document).ready(function(){
    // figure out which page I'm on 
    var page_name = $("body").attr("id");
    // if on product detail view, which product am I seeing
    var product_detail_index = JSON.parse(localStorage.getItem("savedproduct_detail_index"));

    // load cart from local storage, used accross all pages
    cartList = JSON.parse(localStorage.getItem("savedCart"));
    // cart is empty
    if (cartList == null) {
        cartList = [];
    } else {
        //update the number on cart
        $("#cart").text(function(){
            return "Cart ("+get_total_quantity()+")";
        });
    }

    //////////// generate page content /////////////

    // when user currently seeing home page, generate content
    if (page_name == "home_page") {
    // ganerates the products on page for home page (content generation)
        for (i=1; i<nameList.length; i++){
            $new_product = $('.product:last').clone();
            $new_product.insertAfter('.product:last');
            update_product_item($new_product,i);
        }
    }

    /* when on product detail page, generate content based on
       which product the user is curretly viewing */
    if (page_name == "detail_page") {
        update_product_item($('.product'), product_detail_index);
        $('body').find('h2').text(function(){
            return "About Our "+nameList[product_detail_index];
        });
        $('.detail_img').attr("src", "../resources/images/detail_img"+product_detail_index+".png");
    }

    // in cart page, generate content 
    if (page_name == "cart_page") {
        if (get_total_quantity() == 0) {
            $('.item').remove();
            alert("Your car is empty! Go to Home page to add more product!")
        } else {
            // content generation for all the items in the cart, name, price, quantity
            // update the first item
            $item = $('.item');
            update_cart_item($item, 0);
            // generate items in cart, when cart is not empty
            for (i = 1; i < cartList.length; i++) {
                $new_item = $('.item:last').clone();
                update_cart_item($new_item, i);
                $new_item.insertAfter('.item:last');
            }
        }
        // update total quantity and total price
        var total_p = get_total_price();
        var total_q = get_total_quantity();
        $('.total_quantity').text(function(){
            return "Total ("+total_q+" items): $"+total_p;
        })
        $checkout_block = $('.checkout').clone();
        $checkout_block.insertAfter('.cart');
    }

    //////////// click event handlers in home view /////////////

    // add to cart button clocked, in home and product detail view 
    $("button.add_button").click(function(){
        var product_name = $(this).attr('name');
        var index = get_index(product_name);
        var product_price = priceList[index];
        // find the div for this product
        $product = $(this).parent().parent();
        var product_quantity = parseInt(($product).find("input.quantity_input").attr("value"));
        var product_shape = $('#' + product_name).find("input[name='shape']:checked").val();
        add_product_to_cart(product_name, product_price,product_shape, product_quantity);
        // change number in cart icon
        $("#cart").text(function(){
            return "Cart ("+get_total_quantity()+")";
        });
        // save cart to local storage
        localStorage.setItem("savedCart", JSON.stringify(cartList));
    });

    // change quantity when user click plus/minus button
    $(".minus_button").click(function(){
        var quantity = parseInt($(this).next().attr('value'));
        quantity = (quantity>0) ? quantity-1 :0;
        $(this).next().attr('value',quantity);
    });
    $(".plus_button").click(function(){
        var quantity = parseInt($(this).prev().attr('value'));
        quantity = quantity + 1;
        $(this).prev().attr('value',quantity);
    });

    //////////// click event handlers in cart view /////////////

    // delete button in cart view 
    $("button.delete_button").click(function(){
        var item_id = $(this).attr('name');
        var index = item_id[item_id.length -1];
        cartList.splice(index, 1);
        localStorage.setItem("savedCart", JSON.stringify(cartList));
        location.reload();
    });

    // prepare to jump to product detail view
    $(".detail_link").click(function() {
        $product = $(this).parent().parent();
        var index = parseInt(get_index(($product).attr("id")));
        localStorage.setItem("savedproduct_detail_index", JSON.stringify(index));

    });

});

//////////// content generation routines /////////////

/* content generation for each product, name, price and so on, used 
   on both home view and detail view
*/
function update_product_item(block, i) {
    var page_name = $("body").attr("id");
    var img_src = '';
    if (page_name == "home_page") {
        img_src = "resources/images/pillow"+i+".png";
    } else {
        img_src = "../resources/images/pillow"+i+".png"
    }
    $(block).find('img').attr('src',img_src);
    $(block).find('h1.product_name').html(nameList[i]+"<br />$"+priceList[i]);
    $(block).attr('id', idList[i]);
    // the add to cart button
    $(block).find('button').attr('name', idList[i]);
}

// content generation for each entry in cart: name, price, quantity and so on
function update_cart_item(item, i) {
    var product = cartList[i];
    var product_name = product.product_name;
    var index = get_index(product_name);
    $(item).attr('id', 'item_'+i);
    $(item).find('button.delete_button').attr('name', 'item_'+i);
    $(item).find('h1.item_name').text(function(){
        return nameList[index];
    });
    var img_src = "../resources/images/pillow"+index+".png";
    $(item).find('img').attr('src',img_src);
    var q = product.product_quantity;
    var p = product.product_price;
    var s = product.product_shape;
    $(item).find('p.selection_shape').text(function(){
            return "Shape: "+s;
        });
    $(item).find('input.item_quantity_input').attr('value', q)
    $(item).find('h1.item_price').text(function(){
            return '$'+p*q;
        });

}


//////////// simple helper functions /////////////

// get index of the product
function get_index(product_name) {
    for (j = 0; j<4; j++) {
        if (idList[j] == product_name) {
            return j;
        }
    }
}

/* 
For the sake of simplicity, the basic properties of a product: name, 
price, shape and quantity will be represented as n, p, s, q
    n: product_name
    p: product_price
    s: product_shape
    q: product_quantity
*/
function add_product_to_cart(n, p, s, q) {
    if (q == 0) {
        return;
    }
    var i = get_index(n);
    var inCart = false;
    for (i = 0; i < cartList.length; i++){
        var name = cartList[i].product_name;
        var shape = cartList[i].product_shape;
        if ((n == name)&& (s == shape)){
            cartList[i].product_quantity += q;
            inCart = true;
        }
    }

    if (inCart == false) {
        var new_product = new Product(n, p, s, q);
        cartList.push(new_product);
    }
}

// get quantity of all items in cart
function get_total_quantity() {
    var total = 0;
    for (i = 0; i < cartList.length; i++) {
        total += cartList[i].product_quantity;
    }
    return total;
}

// get total price of all items in cart
function get_total_price() {
    var total = 0;
    for (i = 0; i < cartList.length; i++) {
        var product = cartList[i];
        total += product.product_price * product.product_quantity;
    }
    return total;
}

//////////// the product object /////////////

function Product(product_name, product_price, product_shape, product_quantity) {
    this.product_name = product_name;
    this.product_price = product_price;
    this.product_shape = product_shape;
    this.product_quantity = product_quantity;
}



