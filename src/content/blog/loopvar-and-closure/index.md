---
title: 循环变量与闭包
tags: [编程, Go, JavaScript, Python, C++]
category: [编程语言]
image: ./cover.jpg
---
## 起因

在2023年9月19日，Go发布的[1.22版本](https://go.dev/blog/loopvar-preview)，修复了循环变量作用域的问题，最近在用其他语言写代码时，也遇到了类似的问题。于是意识到不同的编程语言对这种情况的处理有所不同，便有了这篇文章。

## Go

首先回顾一下Go语言的循环变量问题，考虑下面的简单代码，生成多个打印数字的函数，然后调用这些函数。

```go
package main
import "fmt"
var funcs []func()

func main() {
    for i := 0; i < 3; i++ {
        funcs = append(funcs, func() {
            fmt.Println(i)
        })
    }
    for _, f := range funcs {
        f()
    }
}
```

预期输出为

```plaintext
0
1
2
```

但实际输出为

```plaintext
3
3
3
```

见多识广的你可能已经猜到了：首先Go语言中循环变量在每次循环时会重复使用（当然，从1.22开始，[每次迭代都有自己单独的循环变量](https://go.dev/ref/spec#For_clause)），而不是重新创建一个新的变量。其次上述示例中的闭包函数以引用的方式捕获了变量[^variable_capture]（实际上是使用指针实现的）。这些因素共同造成了上述的输出不符合预期。

[^variable_capture]: 关于变量是怎么被捕获的，可以看一下[Go internals: capturing loop variables in closures](https://eli.thegreenplace.net/2019/go-internals-capturing-loop-variables-in-closures/)这篇文章。

那么如何修复呢？只需要添加一个局部变量即可。

```go
for i := 0; i < 3; i++ {
    i := i // 给一个局部变量赋值
    funcs = append(funcs, func() {
        fmt.Println(i)
    })
}
```

或者通过闭包保持循环变量的值，本质上都是一样的。

```go
for i := 0; i < 3; i++ {
    // 定义闭包函数
    var make_func = func(x int) func() {
        var func1 = func() {
            fmt.Println(x)
        }
        return func1
    }
    funcs = append(funcs, make_func(i))
}
```

看上去不太优雅，不过从1.22开始，不需要这些额外的操作了。

## JavaScript

看一看JavaScript中的情况。编写一个类似的代码。

```javascript
const funcs = []
for (let i = 0; i < 3; i++) {
    funcs.push(() => console.log(i))
}
for (const f of funcs) {
    f()
}
```

执行后你会发现输出为

```plaintext
0
1
2
```

这是因为JavaScript的`for`中使用`let`或`const`声明的变量是语句的局部变量，属于其块级作用域，于是表现上和Go 1.22一致了，自然也就没有最开始循环变量的问题了。但是，如果你使用了古老的`var`，那么情况就和Go 1.22之前一样了[^js_for][^js_closure]

[^js_for]: 详细的解释可以看一下 [MDN: for](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for#initialization)。

[^js_closure]: 如果你好奇JavaScript处理闭包的技术细节，可以参数 [变量作用域，闭包](https://zh.javascript.info/closure)。

## Python

那么Python的情况呢，首先我们要知道，Python中只有模块（module），类（class）以及函数（def、lambda）才会引入新的作用域，其他代码块（如`if`、`for`、`while`）都不会引入新的作用域。同时，Python中的闭包是以引用的方式捕获变量的，所以我们已经可以猜到最终输出是相同值了。

```python
funcs = []
for i in range(3):
    funcs.append(lambda: print(i))
for f in funcs:
    f()
```

输出为

```plaintext
2
2
2
```

由于`for`不创建块级作用域，创建局部变量的方法失效了，但我们仍然可以用闭包的方法解决这个问题。

```python
funcs = []
for i in range(3):
    funcs.append((lambda x: lambda: print(x))(i))
    # 或者使用默认参数
    # funcs.append(lambda i=i: print(i))
for f in funcs:
    f()
```

## C++

C++的循环变量是重复使用的，但是C++的情况有些特殊，因为C++允许开发人员指定lambda使用值捕获还是引用捕获[^lambda_capture]。既然允许使用值捕获，那么自然不存在上述循环变量的问题了。

[^lambda_capture]: 详细用法可以看一下 [C++ Reference: lambda 表达式](https://zh.cppreference.com/w/cpp/language/lambda#lambda_.E6.8D.95.E8.8E.B7)。

```cpp
#include<functional>
#include<iostream>
#include<vector>
std::vector<std::function<void()>> fList;
int main() {
    for (int i = 0; i < 3; i++) {
        fList.push_back([i]() { 
            std::cout << "i = " << i << std::endl;
        });
    }
    for (auto f: fList) {
        f();
    }
}
```

执行后输出为

```plaintext
i = 0
i = 1
i = 2
```

注意你不能把lambda函数中的值捕获`[i](){...}`直接改为引用捕获`[&i](){...}`，这会导致悬垂引用，因为`i`在循环结束后就被销毁了。

## 总结

本文对4种语言循环变量的表现进行了解释，但是并没有深入讨论，如果深入，就需要考虑编译器和汇编层面的东西。如果对底层实现感兴趣，可以深入研究一下不同语言闭包捕获变量的机制。对于开发来说，注意循环变量的作用域，以及闭包的捕获方式，可以避免一些不必要的错误，这就足够了。
