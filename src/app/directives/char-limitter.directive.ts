import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';

/**
 * Erhan BURHAN
 * eburhan@gmail.com
 * 10.02.2022
 */
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[clMaximum]',
  providers: []
})
export class CharLimitterDirective implements OnInit, OnDestroy, AfterViewInit {

  @Input() clMaximum    = 255;
  @Input() clTemplate   = '{0}/{1}';
  @Input() clElement    = 'div';
  @Input() clClass      = 'char-limitter';
  @Input() clClassOver  = 'char-limitter-over';
  @Input() clClassFlush = 'char-limitter-over-flush';
  @Input() clClassInput = 'char-limitter-input';
  @Input() clFlush      = false;

  private _charElement!: HTMLElement;
  private _resizeObserver$!: ResizeObserver;

  constructor(private elem: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // kalan karakter sayısını gösteren elemanı burada oluşturuyoruz!
    this._charElement = this.renderer.createElement(this.clElement);
    // Input alanının genişliğini alıyoruz. Char elemanı ile eşitleyeceğiz.
    let inputWidth    = this.elem.nativeElement.offsetWidth;
    // Input alanı her yeniden boyutlandırıldığında, yeni genişliğini tekrar alıyoruz.
    // böylece Kalan Karakter sayısını gösteren alanımız Input ile hep aynı genişlikte kalıyor ;)
    this._resizeObserver$ = new ResizeObserver(entries => {
      const entry = entries[0]; // input elemanı
      inputWidth  = (undefined !== entry.borderBoxSize && Array.isArray(entry.borderBoxSize))
        ? entry.borderBoxSize[0]?.inlineSize
        : inputWidth;
      this.renderer.setStyle(this._charElement, 'width', `${inputWidth}px`);
    });
    this._resizeObserver$.observe(this.elem.nativeElement);
  }

  /**
   * Kalan Karakter bilgisi ekranda nasıl görüntülenecek?
   * @param currentLength
   * @private
   */
  private _renderTemplate(currentLength: number): string {
    const remainingLength = this.clMaximum - currentLength;
    const templateCurrent = this.clTemplate;
    return templateCurrent
              .replace('{0}', String(currentLength))
                .replace('{1}', String(this.clMaximum))
                  .replace('{2}', String(remainingLength));
  }

  /**
   * Input alanı içindeyken klavyeden her tuşa basıldığında...
   */
  @HostListener('keyup') onKeyup() {
    let charText    = '';
    const inputElem = this.elem.nativeElement;
    const charElem  = this._charElement;

    const parentText  = inputElem.value;
    const parentLength = parseInt(parentText.length, 10);

    if (parentLength >= this.clMaximum) {
      charText = this._renderTemplate(this.clMaximum);
      // metnin, sınırı aşan tarafını atıyoruz. kalan tarafını geri setliyoruz.
      inputElem.value = parentText.substr(0, this.clMaximum);
      this.renderer.addClass(charElem, this.clClassOver);
      if (this.clFlush) {
        this.renderer.addClass(charElem, this.clClassFlush);
      }
      this.renderer.setValue(charElem.firstChild, charText);
      return;
    }

    // KalanKarakter kısmındaki elemanı yeniden render ediyoruz!
    charText = this._renderTemplate(parentLength);
    this.renderer.removeClass(charElem, this.clClassOver);
    if (this.clFlush) {
      this.renderer.removeClass(charElem, this.clClassFlush);
    }
    this.renderer.setValue(charElem.firstChild, charText);
  }

  /**
   * burası yalnızca ilk başta 1 kez çalışmakta olan metotdur!
   */
  ngAfterViewInit() {
    const inputElement = this.elem.nativeElement;
    const inputLength  = parseInt(inputElement.value.length, 10);

    // eğer "maxlength" özelliği eklenmiş ise direkt oradan değeri alıyoruz!
    const maxLength = inputElement.getAttribute('maxlength');
    if (!maxLength) {
      inputElement.setAttribute('maxlength', this.clMaximum);
    } else {
      this.clMaximum = parseInt(maxLength, 10);
    }

    const textOutput  = this._renderTemplate(inputLength);
    const textElement = this.renderer.createText(textOutput);

    this.renderer.addClass(this._charElement, this.clClass);
    this.renderer.appendChild(this._charElement, textElement);
    this.renderer.addClass(inputElement, this.clClassInput);

    // burada bir nevi "InsertAfter" yapıyoruz. yani hemen biteşiğine bizim Kalan Karakter alanımızı ekliyoruz!
    this.renderer.insertBefore(inputElement.parentNode, this._charElement, inputElement.nextSibling);
  }

  /**
   * Input alanı için Resize gözlemlemesi yapmayı bırak!
   */
  ngOnDestroy() {
    this._resizeObserver$.unobserve(this.elem.nativeElement);
  }

} // end-of-class
