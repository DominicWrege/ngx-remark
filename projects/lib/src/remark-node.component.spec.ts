import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemarkNodeComponent } from './remark-node.component';
import { RemarkTemplatesService } from './remark-templates.service';
import { RemarkComponent } from './remark.component';
import { RemarkTemplateDirective } from './remark-template.directive';
import { Root } from 'mdast';
import { SimpleChanges } from '@angular/core';

function getNode(text: string, heading = 0) {
  return {
    type: 'root',
    children: [
      {
        type: heading ? 'heading' : 'paragraph',
        depth: heading || undefined,
        children: [{ type: 'text', value: text }],
      },
    ],
  } as Root;
}

describe('RemarkNodeComponent', () => {
  let component: RemarkNodeComponent;
  let fixture: ComponentFixture<RemarkNodeComponent>;

  beforeEach(async () => {
    // CRITICAL: Set up spies BEFORE any component instantiation

    await TestBed.configureTestingModule({
      imports: [RemarkComponent, RemarkTemplateDirective, RemarkNodeComponent],
      providers: [RemarkTemplatesService],
    }).compileComponents();

    // Create parent to get template service
    const parentFixture = TestBed.createComponent(RemarkComponent);
    parentFixture.componentRef.setInput('markdown', '# Hello');

    // Note: If RemarkComponent creates RemarkNodeComponent children internally,
    // this detectChanges() will trigger ngOnInit calls on those children.
    // This is why spies must be set up before this point.
    parentFixture.detectChanges();

    // Create the component under test
    fixture = TestBed.createComponent(RemarkNodeComponent);
    component = fixture.componentInstance;
    component.templateService =
      parentFixture.componentInstance.remarkTemplatesService;
  });

  describe('with paragraph', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('remarkNode', getNode('Hello'));
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
      // Note: Call counts include any components created by parentFixture above
    });

    it('should render paragraph', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelector('p')?.textContent).toContain('Hello');
    });

    it('should update text', () => {
      const el = fixture.nativeElement.querySelector('p');

      fixture.componentRef.setInput('remarkNode', getNode('World'));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('p')?.textContent).toContain(
        'World',
      );
      expect(fixture.nativeElement.querySelector('p')).toBe(el);
    });

    it('should change switch to a heading', () => {
      fixture.componentRef.setInput('remarkNode', getNode('World', 2));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('h2')?.textContent).toContain(
        'World',
      );
      expect(fixture.nativeElement.querySelector('p')).toBeFalsy();
    });
  });

  describe('with list', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('remarkNode', {
        type: 'root',
        children: [
          {
            type: 'list',
            ordered: false,
            children: [
              {
                type: 'listItem',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', value: 'One' }],
                  },
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', value: 'Two' }],
                  },
                ],
              },
              {
                type: 'listItem',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ type: 'text', value: 'Three' }],
                  },
                ],
              },
            ],
          },
        ],
      });
      fixture.detectChanges();
    });

    it('should render list', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      expect(compiled.querySelectorAll('li').length).toBe(2);
      expect(compiled.querySelectorAll('li')[0].textContent).toContain('One');
      expect(compiled.querySelectorAll('li')[1].textContent).toContain('Three');
    });

    it('should skip single paragraph list items', () => {
      const compiled: HTMLElement = fixture.nativeElement;
      expect(
        compiled.querySelectorAll('li')[0].querySelectorAll('p').length,
      ).toBe(2);
      expect(
        compiled.querySelectorAll('li')[1].querySelectorAll('p').length,
      ).toBe(0);
    });
  });
});
